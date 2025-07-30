import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import '../models/quiz_model.dart';

class QuizController extends GetxController {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;

  final RxList<QuizModel> _quizzes = <QuizModel>[].obs;
  List<QuizModel> get quizzes => _quizzes;
  
  final RxBool isLoading = false.obs;

  /// Check if user can take a quiz (hasn't taken it before)
  Future<bool> canUserTakeQuiz(String userId, String quizId) async {
    try {
      final hasCompleted = await hasUserTakenQuiz(userId, quizId);
      return !hasCompleted;
    } catch (e) {
      Get.snackbar('Error', 'Failed to check quiz eligibility: $e');
      return false;
    }
  }

  Future<void> loadQuizzes() async {
    try {
      isLoading.value = true;
      final snapshot = await _firestore.collection('quizzes').get();
      _quizzes.value = snapshot.docs
          .map((doc) => QuizModel.fromMap(doc.data(), doc.id))
          .toList();
    } catch (e) {
      Get.snackbar('Error', 'Failed to load quizzes: $e');
    } finally {
      isLoading.value = false;
    }
  }

  Future<QuizModel?> getQuiz(String quizId) async {
    try {
      final doc = await _firestore.collection('quizzes').doc(quizId).get();
      if (doc.exists) {
        return QuizModel.fromMap(doc.data()!, doc.id);
      }
    } catch (e) {
      Get.snackbar('Error', 'Failed to get quiz: $e');
    }
    return null;
  }

  Future<bool> submitQuizResult(QuizResultModel result) async {
    try {
      // First check if user has already taken this quiz
      final existingResult = await hasUserTakenQuiz(result.userId, result.quizId);
      if (existingResult) {
        Get.snackbar(
          'Error', 
          'You have already completed this quiz. Each quiz can only be taken once.',
          backgroundColor: Colors.red,
          colorText: Colors.white,
        );
        return false;
      }

      // Submit the result
      await _firestore.collection('results').add(result.toMap());
      Get.snackbar(
        'Success', 
        'Quiz result submitted successfully!',
        backgroundColor: Colors.green,
        colorText: Colors.white,
      );
      return true;
    } catch (e) {
      Get.snackbar(
        'Error', 
        'Failed to submit quiz result: $e',
        backgroundColor: Colors.red,
        colorText: Colors.white,
      );
      return false;
    }
  }

  Future<List<QuizResultModel>> getUserResults(String userId) async {
    try {
      // Try server-side sorting first (requires index)
      try {
        final snapshot = await _firestore
            .collection('results')
            .where('userId', isEqualTo: userId)
            .orderBy('completedAt', descending: true)
            .get();

        return snapshot.docs
            .map((doc) => QuizResultModel.fromMap(doc.data(), doc.id))
            .toList();
      } catch (indexError) {
        // Fallback to client-side sorting if index doesn't exist
        print('Index not available, using client-side sorting: $indexError');
        
        final snapshot = await _firestore
            .collection('results')
            .where('userId', isEqualTo: userId)
            .get();

        final results = snapshot.docs
            .map((doc) => QuizResultModel.fromMap(doc.data(), doc.id))
            .toList();
        
        // Sort by completedAt in descending order (most recent first)
        results.sort((a, b) => b.completedAt.compareTo(a.completedAt));
        
        return results;
      }
    } catch (e) {
      Get.snackbar('Error', 'Failed to get user results: $e');
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
      Get.snackbar('Error', 'Failed to check quiz completion: $e');
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
      Get.snackbar('Error', 'Failed to get user quiz result: $e');
      return null;
    }
  }
}
