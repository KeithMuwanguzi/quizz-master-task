import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import '../models/quiz_model.dart';

class QuizService extends ChangeNotifier {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;

  List<QuizModel> _quizzes = [];
  List<QuizModel> get quizzes => _quizzes;

  Future<void> loadQuizzes() async {
    try {
      final snapshot = await _firestore.collection('quizzes').get();
      _quizzes = snapshot.docs
          .map((doc) => QuizModel.fromMap(doc.data(), doc.id))
          .toList();
      notifyListeners();
    } catch (e) {
      print('Error loading quizzes: $e');
    }
  }

  Future<QuizModel?> getQuiz(String quizId) async {
    try {
      final doc = await _firestore.collection('quizzes').doc(quizId).get();
      if (doc.exists) {
        return QuizModel.fromMap(doc.data()!, doc.id);
      }
    } catch (e) {
      print('Error getting quiz: $e');
    }
    return null;
  }

  Future<void> submitQuizResult(QuizResultModel result) async {
    try {
      await _firestore.collection('results').add(result.toMap());
    } catch (e) {
      print('Error submitting quiz result: $e');
    }
  }

  Future<List<QuizResultModel>> getUserResults(String userId) async {
    try {
      final snapshot = await _firestore
          .collection('results')
          .where('userId', isEqualTo: userId)
          .orderBy('completedAt', descending: true)
          .get();

      return snapshot.docs
          .map((doc) => QuizResultModel.fromMap(doc.data(), doc.id))
          .toList();
    } catch (e) {
      print('Error getting user results: $e');
      return [];
    }
  }

  Future<bool> hasUserTakenQuiz(String userId, String quizId) async {
    try {
      final snapshot = await _firestore
          .collection('results')
          .where('userId', isEqualTo: userId)
          .where('quizId', isEqualTo: quizId)
          .limit(1)
          .get();

      return snapshot.docs.isNotEmpty;
    } catch (e) {
      print('Error checking quiz completion: $e');
      return false;
    }
  }

  Future<QuizResultModel?> getUserQuizResult(
      String userId, String quizId) async {
    try {
      final snapshot = await _firestore
          .collection('results')
          .where('userId', isEqualTo: userId)
          .where('quizId', isEqualTo: quizId)
          .limit(1)
          .get();

      if (snapshot.docs.isNotEmpty) {
        return QuizResultModel.fromMap(
            snapshot.docs.first.data(), snapshot.docs.first.id);
      }
      return null;
    } catch (e) {
      print('Error getting user quiz result: $e');
      return null;
    }
  }
}
