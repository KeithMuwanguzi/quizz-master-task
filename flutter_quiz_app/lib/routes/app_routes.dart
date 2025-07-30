import 'package:get/get.dart';
import '../screens/auth_wrapper.dart';
import '../screens/auth_screen.dart';
import '../screens/home_screen.dart';
import '../screens/quiz_screen.dart';
import '../screens/results_screen.dart';
import '../models/quiz_model.dart';

class AppRoutes {
  static const String initial = '/';
  static const String auth = '/auth';
  static const String home = '/home';
  static const String quiz = '/quiz';
  static const String results = '/results';

  static List<GetPage> routes = [
    GetPage(
      name: initial,
      page: () => const AuthWrapper(),
    ),
    GetPage(
      name: auth,
      page: () => const AuthScreen(),
    ),
    GetPage(
      name: home,
      page: () => const HomeScreen(),
    ),
    GetPage(
      name: quiz,
      page: () => QuizScreen(quiz: Get.arguments as QuizModel),
    ),
    GetPage(
      name: results,
      page: () => const ResultsScreen(),
    ),
  ];
}
