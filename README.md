# Educational Quiz App

A complete educational platform with a Flutter mobile app for students and a Next.js admin panel for teachers.

## Project Structure

- `flutter_quiz_app/` - Flutter mobile application for students
- `admin_panel/` - Next.js TypeScript admin panel for teachers
- `firebase/` - Firebase configuration and rules

## Features

### Flutter App (Students)
- User authentication
- Browse available quizzes
- Take quizzes with multiple choice questions
- View quiz results and history

### Admin Panel (Teachers)
- Admin authentication
- Create and manage quizzes
- Add/edit questions
- View student results and analytics

### Firebase Integration
- Authentication for both students and admins
- Firestore database for quizzes, questions, and results
- Real-time data synchronization

## Setup Instructions

1. Set up Firebase project
2. Configure Flutter app with Firebase
3. Configure Next.js admin panel with Firebase
4. Deploy Firebase security rules

## Tech Stack

- **Mobile**: Flutter (Dart)
- **Admin Panel**: Next.js 14 (TypeScript)
- **Backend**: Firebase (Auth + Firestore)
- **Styling**: Tailwind CSS (Admin Panel)