'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc, setDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword, deleteUser } from 'firebase/auth';
import { db, auth } from '@/lib/firebase';
import { User } from '@/lib/types';
import { UserPlus, Trash2, Edit, Users, Shield, GraduationCap } from 'lucide-react';
import UserMigration from './UserMigration';

interface UserManagementProps {
    currentUser: User;
}

export default function UserManagement({ currentUser }: UserManagementProps) {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'student' as 'admin' | 'student'
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const usersSnapshot = await getDocs(collection(db, 'users'));
            const usersData = usersSnapshot.docs.map(doc => ({
                ...doc.data(),
                uid: doc.id // Document ID is the UID
            })) as User[];
            setUsers(usersData);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Create user in Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                formData.email,
                formData.password
            );

            // Save user data to Firestore using UID as document ID
            await setDoc(doc(db, 'users', userCredential.user.uid), {
                uid: userCredential.user.uid,
                email: formData.email,
                name: formData.name,
                role: formData.role,
                createdAt: Date.now(),
                createdBy: currentUser.uid,
                isActive: true,
                lastLoginAt: null
            });

            // Reset form
            setFormData({ name: '', email: '', password: '', role: 'student' });
            setShowCreateForm(false);

            // Refresh users list
            await fetchUsers();

            alert('User created successfully!');
        } catch (error: any) {
            console.error('Error creating user:', error);
            alert(`Error creating user: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingUser) return;

        setLoading(true);
        try {
            const userDoc = doc(db, 'users', editingUser.uid);
            await updateDoc(userDoc, {
                name: formData.name,
                role: formData.role,
                updatedAt: Date.now(),
                updatedBy: currentUser.uid
            });

            setEditingUser(null);
            setFormData({ name: '', email: '', password: '', role: 'student' });
            await fetchUsers();

            alert('User updated successfully!');
        } catch (error: any) {
            console.error('Error updating user:', error);
            alert(`Error updating user: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (user: User) => {
        if (!confirm(`Are you sure you want to delete ${user.name}?`)) return;

        setLoading(true);
        try {
            // Delete from Firestore using UID as document ID
            await deleteDoc(doc(db, 'users', user.uid));
            await fetchUsers();
            alert('User deleted successfully!');
        } catch (error: any) {
            console.error('Error deleting user:', error);
            alert(`Error deleting user: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const startEdit = (user: User) => {
        setEditingUser(user);
        setFormData({
            name: user.name,
            email: user.email,
            password: '',
            role: user.role
        });
        setShowCreateForm(true);
    };

    const cancelEdit = () => {
        setEditingUser(null);
        setFormData({ name: '', email: '', password: '', role: 'student' });
        setShowCreateForm(false);
    };

    if (loading && users.length === 0) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    const adminCount = users.filter(user => user.role === 'admin').length;
    const studentCount = users.filter(user => user.role === 'student').length;

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
                    <p className="text-gray-600">Manage admin and student accounts</p>
                </div>
                <button
                    onClick={() => setShowCreateForm(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                    disabled={loading}
                >
                    <UserPlus size={20} />
                    Create User
                </button>
            </div>

            {/* User Migration Section */}
            <div className="mb-6">
                <UserMigration />
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg shadow border">
                    <div className="flex items-center gap-3">
                        <Users className="text-blue-600" size={24} />
                        <div>
                            <p className="text-sm text-gray-600">Total Users</p>
                            <p className="text-2xl font-bold">{users.length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow border">
                    <div className="flex items-center gap-3">
                        <Shield className="text-green-600" size={24} />
                        <div>
                            <p className="text-sm text-gray-600">Admins</p>
                            <p className="text-2xl font-bold">{adminCount}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow border">
                    <div className="flex items-center gap-3">
                        <GraduationCap className="text-purple-600" size={24} />
                        <div>
                            <p className="text-sm text-gray-600">Students</p>
                            <p className="text-2xl font-bold">{studentCount}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Create/Edit User Form */}
            {showCreateForm && (
                <div className="bg-white p-6 rounded-lg shadow border mb-6">
                    <h3 className="text-lg font-semibold mb-4">
                        {editingUser ? 'Edit User' : 'Create New User'}
                    </h3>
                    <form onSubmit={editingUser ? handleUpdateUser : handleCreateUser} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                    disabled={editingUser !== null}
                                />
                            </div>
                        </div>

                        {!editingUser && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Password
                                </label>
                                <input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                    minLength={6}
                                />
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Role
                            </label>
                            <select
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value as 'admin' | 'student' })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="student">Student</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>

                        <div className="flex gap-2">
                            <button
                                type="submit"
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                                disabled={loading}
                            >
                                {editingUser ? 'Update User' : 'Create User'}
                            </button>
                            <button
                                type="button"
                                onClick={cancelEdit}
                                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Users Table */}
            <div className="bg-white rounded-lg shadow border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    User
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Email
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Role
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {users.map((user) => (
                                <tr key={user.uid} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10">
                                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                                    <span className="text-blue-600 font-medium">
                                                        {user.name.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {user.email}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${user.role === 'admin'
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-purple-100 text-purple-800'
                                            }`}>
                                            {user.role === 'admin' ? (
                                                <><Shield size={12} className="mr-1" /> Admin</>
                                            ) : (
                                                <><GraduationCap size={12} className="mr-1" /> Student</>
                                            )}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => startEdit(user)}
                                                className="text-blue-600 hover:text-blue-900"
                                                disabled={loading}
                                            >
                                                <Edit size={16} />
                                            </button>
                                            {user.uid !== currentUser.uid && (
                                                <button
                                                    onClick={() => handleDeleteUser(user)}
                                                    className="text-red-600 hover:text-red-900"
                                                    disabled={loading}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}