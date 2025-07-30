import 'package:get/get.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import '../models/user_model.dart';

class AuthController extends GetxController {
  final FirebaseAuth _auth = FirebaseAuth.instance;
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  
  final Rx<UserModel?> _user = Rx<UserModel?>(null);
  UserModel? get user => _user.value;
  
  final RxBool isLoading = false.obs;

  @override
  void onInit() {
    super.onInit();
    _auth.authStateChanges().listen(_onAuthStateChanged);
  }

  Future<void> _onAuthStateChanged(User? firebaseUser) async {
    if (firebaseUser != null) {
      final userDoc = await _firestore.collection('users').doc(firebaseUser.uid).get();
      if (userDoc.exists) {
        _user.value = UserModel.fromMap(userDoc.data()!);
      }
    } else {
      _user.value = null;
    }
  }

  Future<String?> signUp(String email, String password, String name) async {
    try {
      isLoading.value = true;
      final credential = await _auth.createUserWithEmailAndPassword(
        email: email,
        password: password,
      );
      
      if (credential.user != null) {
        final userModel = UserModel(
          uid: credential.user!.uid,
          email: email,
          name: name,
          role: 'student',
        );
        
        await _firestore.collection('users').doc(credential.user!.uid).set(userModel.toMap());
        _user.value = userModel;
      }
      return null;
    } catch (e) {
      return e.toString();
    } finally {
      isLoading.value = false;
    }
  }

  Future<String?> signIn(String email, String password) async {
    try {
      isLoading.value = true;
      await _auth.signInWithEmailAndPassword(email: email, password: password);
      return null;
    } catch (e) {
      return e.toString();
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> signOut() async {
    await _auth.signOut();
  }
}