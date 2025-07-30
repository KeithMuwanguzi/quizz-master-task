import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:shimmer/shimmer.dart';
import '../services/quiz_service.dart';
import '../services/auth_service.dart';
import '../models/quiz_model.dart';

class QuizListScreen extends StatefulWidget {
  const QuizListScreen({super.key});

  @override
  State<QuizListScreen> createState() => _QuizListScreenState();
}

class _QuizListScreenState extends State<QuizListScreen> {
  final QuizController _quizController = Get.find<QuizController>();
  final AuthController _authController = Get.find<AuthController>();
  
  final Map<String, bool> _quizCompletionStatus = {};
  final Map<String, QuizResultModel?> _quizResults = {};

  @override
  void initState() {
    super.initState();
    _loadQuizzes();
  }

  Future<void> _loadQuizzes() async {
    await _quizController.loadQuizzes();
    
    if (_authController.user != null) {
      // Check completion status for each quiz
      for (var quiz in _quizController.quizzes) {
        final hasCompleted = await _quizController.hasUserTakenQuiz(_authController.user!.uid, quiz.id);
        final result = await _quizController.getUserQuizResult(_authController.user!.uid, quiz.id);
        _quizCompletionStatus[quiz.id] = hasCompleted;
        _quizResults[quiz.id] = result;
      }
      setState(() {}); // Update UI after loading completion status
    }
  }

  @override
  Widget build(BuildContext context) {
    return Obx(() {
      if (_quizController.isLoading.value) {
        return _buildShimmerLoading();
      }

      if (_quizController.quizzes.isEmpty) {
        return _buildEmptyState();
      }

      return RefreshIndicator(
        onRefresh: _loadQuizzes,
        color: const Color(0xFF6366F1),
        child: ListView.builder(
          padding: const EdgeInsets.all(20),
          itemCount: _quizController.quizzes.length,
          itemBuilder: (context, index) {
            final quiz = _quizController.quizzes[index];
            final isCompleted = _quizCompletionStatus[quiz.id] ?? false;
            final result = _quizResults[quiz.id];
            return _buildQuizCard(context, quiz, index, isCompleted, result);
          },
        ),
      );
    });
  }

  Widget _buildShimmerLoading() {
    return ListView.builder(
      padding: const EdgeInsets.all(20),
      itemCount: 5,
      itemBuilder: (context, index) {
        return Shimmer.fromColors(
          baseColor: Colors.grey.shade300,
          highlightColor: Colors.grey.shade100,
          child: Container(
            margin: const EdgeInsets.only(bottom: 16),
            height: 120,
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
            ),
          ),
        );
      },
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: const Color(0xFF6366F1).withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(20),
            ),
            child: const Icon(
              Icons.quiz_outlined,
              size: 64,
              color: Color(0xFF6366F1),
            ),
          ),
          const SizedBox(height: 24),
          Text(
            'No Quizzes Available',
            style: GoogleFonts.inter(
              fontSize: 20,
              fontWeight: FontWeight.w600,
              color: const Color(0xFF1F2937),
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Check back later for new quizzes!',
            style: GoogleFonts.inter(
              fontSize: 16,
              color: const Color(0xFF6B7280),
            ),
          ),
          const SizedBox(height: 32),
          ElevatedButton.icon(
            onPressed: _loadQuizzes,
            icon: const Icon(Icons.refresh),
            label: const Text('Refresh'),
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF6366F1),
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildQuizCard(BuildContext context, QuizModel quiz, int index, bool isCompleted, QuizResultModel? result) {
    final colors = [
      [const Color(0xFF6366F1), const Color(0xFF8B5CF6)],
      [const Color(0xFF10B981), const Color(0xFF059669)],
      [const Color(0xFFF59E0B), const Color(0xFFD97706)],
      [const Color(0xFFEF4444), const Color(0xFFDC2626)],
      [const Color(0xFF8B5CF6), const Color(0xFF7C3AED)],
    ];
    final gradientColors = colors[index % colors.length];

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: isCompleted ? () => _showCompletedQuizDialog(context, quiz, result) : () {
            Get.toNamed('/quiz', arguments: quiz);
          },
          borderRadius: BorderRadius.circular(16),
          child: Container(
            decoration: BoxDecoration(
              gradient: isCompleted 
                  ? LinearGradient(
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                      colors: [Colors.grey.shade400, Colors.grey.shade500],
                    )
                  : LinearGradient(
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                      colors: gradientColors,
                    ),
              borderRadius: BorderRadius.circular(16),
              boxShadow: [
                BoxShadow(
                  color: (isCompleted ? Colors.grey.shade400 : gradientColors[0]).withValues(alpha: 0.3),
                  blurRadius: 10,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Stack(
              children: [
                Padding(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(8),
                            decoration: BoxDecoration(
                              color: Colors.white.withValues(alpha: 0.2),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Icon(
                              isCompleted ? Icons.check_circle : Icons.quiz,
                              color: Colors.white,
                              size: 20,
                            ),
                          ),
                          const Spacer(),
                          if (isCompleted && result != null)
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                              decoration: BoxDecoration(
                                color: Colors.white.withValues(alpha: 0.2),
                                borderRadius: BorderRadius.circular(20),
                              ),
                              child: Text(
                                '${((result.score / result.totalQuestions) * 100).toStringAsFixed(0)}%',
                                style: GoogleFonts.inter(
                                  color: Colors.white,
                                  fontSize: 12,
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                            )
                          else
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                              decoration: BoxDecoration(
                                color: Colors.white.withValues(alpha: 0.2),
                                borderRadius: BorderRadius.circular(20),
                              ),
                              child: Text(
                                '${quiz.questions.length} Questions',
                                style: GoogleFonts.inter(
                                  color: Colors.white,
                                  fontSize: 12,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                            ),
                        ],
                      ),
                      const SizedBox(height: 16),
                      Text(
                        quiz.title,
                        style: GoogleFonts.inter(
                          fontSize: 18,
                          fontWeight: FontWeight.w700,
                          color: Colors.white,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        quiz.description,
                        style: GoogleFonts.inter(
                          fontSize: 14,
                          color: Colors.white.withValues(alpha: 0.9),
                          height: 1.4,
                        ),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 16),
                      Row(
                        children: [
                          Icon(
                            isCompleted ? Icons.done : Icons.access_time,
                            size: 16,
                            color: Colors.white.withValues(alpha: 0.8),
                          ),
                          const SizedBox(width: 4),
                          Text(
                            isCompleted 
                                ? 'Completed'
                                : '${quiz.questions.length * 2} min',
                            style: GoogleFonts.inter(
                              color: Colors.white.withValues(alpha: 0.8),
                              fontSize: 12,
                            ),
                          ),
                          const Spacer(),
                          Container(
                            padding: const EdgeInsets.all(4),
                            decoration: BoxDecoration(
                              color: Colors.white.withValues(alpha: 0.2),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Icon(
                              isCompleted ? Icons.visibility : Icons.arrow_forward,
                              color: Colors.white,
                              size: 16,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                if (isCompleted)
                  Positioned(
                    top: 16,
                    right: 16,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: const Color(0xFF10B981),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Text(
                        'COMPLETED',
                        style: GoogleFonts.inter(
                          color: Colors.white,
                          fontSize: 10,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ),
                  ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  void _showCompletedQuizDialog(BuildContext context, QuizModel quiz, QuizResultModel? result) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Row(
          children: [
            const Icon(Icons.info_outline, color: Color(0xFF6366F1)),
            const SizedBox(width: 8),
            Text(
              'Quiz Already Completed',
              style: GoogleFonts.inter(fontWeight: FontWeight.w600),
            ),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'You have already completed "${quiz.title}". Each quiz can only be taken once.',
              style: GoogleFonts.inter(),
            ),
            if (result != null) ...[
              const SizedBox(height: 16),
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.grey.shade50,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Your Result:',
                      style: GoogleFonts.inter(
                        fontWeight: FontWeight.w600,
                        color: const Color(0xFF1F2937),
                      ),
                    ),
                    const SizedBox(height: 8),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'Score:',
                          style: GoogleFonts.inter(color: const Color(0xFF6B7280)),
                        ),
                        Text(
                          '${result.score}/${result.totalQuestions}',
                          style: GoogleFonts.inter(fontWeight: FontWeight.w600),
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'Percentage:',
                          style: GoogleFonts.inter(color: const Color(0xFF6B7280)),
                        ),
                        Text(
                          '${((result.score / result.totalQuestions) * 100).toStringAsFixed(1)}%',
                          style: GoogleFonts.inter(fontWeight: FontWeight.w600),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text(
              'OK',
              style: GoogleFonts.inter(color: const Color(0xFF6366F1)),
            ),
          ),
        ],
      ),
    );
  }
}