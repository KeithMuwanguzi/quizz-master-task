class QuizModel {
  final String id;
  final String title;
  final String description;
  final List<QuestionModel> questions;
  final DateTime createdAt;

  QuizModel({
    required this.id,
    required this.title,
    required this.description,
    required this.questions,
    required this.createdAt,
  });

  factory QuizModel.fromMap(Map<String, dynamic> map, String id) {
    return QuizModel(
      id: id,
      title: map['title'] ?? '',
      description: map['description'] ?? '',
      questions: (map['questions'] as List<dynamic>?)
          ?.map((q) => QuestionModel.fromMap(q))
          .toList() ?? [],
      createdAt: DateTime.fromMillisecondsSinceEpoch(map['createdAt'] ?? 0),
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'title': title,
      'description': description,
      'questions': questions.map((q) => q.toMap()).toList(),
      'createdAt': createdAt.millisecondsSinceEpoch,
    };
  }
}

class QuestionModel {
  final String question;
  final List<String> options;
  final int correctAnswer;

  QuestionModel({
    required this.question,
    required this.options,
    required this.correctAnswer,
  });

  factory QuestionModel.fromMap(Map<String, dynamic> map) {
    return QuestionModel(
      question: map['question'] ?? '',
      options: List<String>.from(map['options'] ?? []),
      correctAnswer: map['correctAnswer'] ?? 0,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'question': question,
      'options': options,
      'correctAnswer': correctAnswer,
    };
  }
}

class QuizResultModel {
  final String id;
  final String userId;
  final String quizId;
  final int score;
  final int totalQuestions;
  final DateTime completedAt;

  QuizResultModel({
    required this.id,
    required this.userId,
    required this.quizId,
    required this.score,
    required this.totalQuestions,
    required this.completedAt,
  });

  factory QuizResultModel.fromMap(Map<String, dynamic> map, String id) {
    return QuizResultModel(
      id: id,
      userId: map['userId'] ?? '',
      quizId: map['quizId'] ?? '',
      score: map['score'] ?? 0,
      totalQuestions: map['totalQuestions'] ?? 0,
      completedAt: DateTime.fromMillisecondsSinceEpoch(map['completedAt'] ?? 0),
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'userId': userId,
      'quizId': quizId,
      'score': score,
      'totalQuestions': totalQuestions,
      'completedAt': completedAt.millisecondsSinceEpoch,
    };
  }
}