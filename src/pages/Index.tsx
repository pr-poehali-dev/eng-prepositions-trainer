import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { Alert, AlertDescription } from '@/components/ui/alert';
import confetti from 'canvas-confetti';

interface Exercise {
  id: number;
  sentence: string;
  correctAnswer: 'at' | 'on' | 'in';
  options: Array<'at' | 'on' | 'in'>;
}

const exercises: Exercise[] = [
  { id: 1, sentence: 'I wake up ___ 7 AM every day', correctAnswer: 'at', options: ['at', 'on', 'in'] },
  { id: 2, sentence: 'My birthday is ___ March', correctAnswer: 'in', options: ['at', 'on', 'in'] },
  { id: 3, sentence: 'We have a meeting ___ Monday', correctAnswer: 'on', options: ['at', 'on', 'in'] },
  { id: 4, sentence: 'The concert starts ___ midnight', correctAnswer: 'at', options: ['at', 'on', 'in'] },
  { id: 5, sentence: 'She was born ___ 1995', correctAnswer: 'in', options: ['at', 'on', 'in'] },
  { id: 6, sentence: 'Let\'s meet ___ Friday afternoon', correctAnswer: 'on', options: ['at', 'on', 'in'] },
  { id: 7, sentence: 'I go to the gym ___ the evening', correctAnswer: 'in', options: ['at', 'on', 'in'] },
  { id: 8, sentence: 'The store closes ___ 9 PM', correctAnswer: 'at', options: ['at', 'on', 'in'] },
  { id: 9, sentence: 'We usually travel ___ summer', correctAnswer: 'in', options: ['at', 'on', 'in'] },
  { id: 10, sentence: 'The exam is ___ December 15th', correctAnswer: 'on', options: ['at', 'on', 'in'] },
];

const rules = {
  at: ['Точное время: at 5 PM, at noon', 'Праздники: at Christmas, at Easter', 'Моменты дня: at night, at sunrise'],
  on: ['Дни недели: on Monday, on Friday', 'Даты: on March 15th', 'Части дней недели: on Monday morning'],
  in: ['Месяцы: in January', 'Годы: in 2024', 'Части дня: in the morning, in the evening', 'Сезоны: in summer']
};

type View = 'home' | 'exercise' | 'results';

export default function Index() {
  const [view, setView] = useState<View>('home');
  const [currentExercise, setCurrentExercise] = useState(0);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<Array<{ correct: boolean; answer: string }>>([]);
  const [showHint, setShowHint] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);

  const startExercises = () => {
    setView('exercise');
    setCurrentExercise(0);
    setScore(0);
    setAnswers([]);
    setFeedback(null);
    setShowHint(false);
  };

  const handleAnswer = (answer: 'at' | 'on' | 'in') => {
    const isCorrect = answer === exercises[currentExercise].correctAnswer;
    
    if (isCorrect) {
      setScore(score + 1);
      setFeedback('correct');
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } else {
      setFeedback('incorrect');
    }

    setAnswers([...answers, { correct: isCorrect, answer }]);

    setTimeout(() => {
      if (currentExercise < exercises.length - 1) {
        setCurrentExercise(currentExercise + 1);
        setFeedback(null);
        setShowHint(false);
      } else {
        setView('results');
      }
    }, 1500);
  };

  const progress = ((currentExercise + 1) / exercises.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {view === 'home' && (
          <div className="animate-fade-in">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-3xl mb-6 shadow-lg">
                <Icon name="Book" size={40} className="text-white" />
              </div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
                English Trainer
              </h1>
              <p className="text-xl text-gray-600">Тренируй грамматику легко и эффективно</p>
            </div>

            <Card className="mb-8 border-2 hover:shadow-xl transition-all duration-300 hover-scale">
              <CardHeader className="bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-3">
                  <Icon name="Clock" size={28} />
                  Предлоги времени: AT / ON / IN
                </CardTitle>
                <CardDescription className="text-purple-100">
                  Научись правильно использовать предлоги времени в английском
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid md:grid-cols-3 gap-6 mb-6">
                  <div className="bg-orange-50 p-4 rounded-xl border-2 border-orange-200">
                    <Badge className="mb-3 bg-orange-500">AT</Badge>
                    <ul className="text-sm space-y-2 text-gray-700">
                      {rules.at.map((rule, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="text-orange-500">•</span>
                          {rule}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-xl border-2 border-blue-200">
                    <Badge className="mb-3 bg-blue-500">ON</Badge>
                    <ul className="text-sm space-y-2 text-gray-700">
                      {rules.on.map((rule, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="text-blue-500">•</span>
                          {rule}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-xl border-2 border-purple-200">
                    <Badge className="mb-3 bg-purple-500">IN</Badge>
                    <ul className="text-sm space-y-2 text-gray-700">
                      {rules.in.map((rule, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="text-purple-500">•</span>
                          {rule}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <Button 
                  onClick={startExercises}
                  size="lg"
                  className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-lg py-6"
                >
                  <Icon name="Play" className="mr-2" />
                  Начать тренировку ({exercises.length} упражнений)
                </Button>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-3 gap-4">
              <Card className="hover-scale hover:shadow-lg transition-all">
                <CardHeader className="pb-3">
                  <Icon name="Target" size={32} className="text-purple-500 mb-2" />
                  <CardTitle className="text-lg">Упражнения</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm">Интерактивные задания с мгновенной проверкой</p>
                </CardContent>
              </Card>
              <Card className="hover-scale hover:shadow-lg transition-all">
                <CardHeader className="pb-3">
                  <Icon name="TrendingUp" size={32} className="text-blue-500 mb-2" />
                  <CardTitle className="text-lg">Прогресс</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm">Отслеживай свои результаты и улучшения</p>
                </CardContent>
              </Card>
              <Card className="hover-scale hover:shadow-lg transition-all">
                <CardHeader className="pb-3">
                  <Icon name="Lightbulb" size={32} className="text-orange-500 mb-2" />
                  <CardTitle className="text-lg">Подсказки</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm">Правила и примеры всегда под рукой</p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {view === 'exercise' && (
          <div className="animate-fade-in">
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-600">
                  Вопрос {currentExercise + 1} из {exercises.length}
                </span>
                <span className="text-sm font-medium text-purple-600">
                  Счёт: {score}/{currentExercise + 1}
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            <Card className="mb-6 border-2 shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl">
                  {exercises[currentExercise].sentence.replace('___', '______')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  {exercises[currentExercise].options.map((option) => (
                    <Button
                      key={option}
                      onClick={() => handleAnswer(option)}
                      disabled={feedback !== null}
                      size="lg"
                      variant="outline"
                      className={`py-8 text-xl font-bold transition-all ${
                        feedback === 'correct' && option === exercises[currentExercise].correctAnswer
                          ? 'bg-green-500 text-white border-green-600 hover:bg-green-500'
                          : feedback === 'incorrect' && option === exercises[currentExercise].correctAnswer
                          ? 'bg-green-500 text-white border-green-600'
                          : feedback === 'incorrect' && option === answers[answers.length - 1]?.answer
                          ? 'bg-red-500 text-white border-red-600 hover:bg-red-500'
                          : 'hover:bg-purple-50 hover:border-purple-300'
                      }`}
                    >
                      {option.toUpperCase()}
                    </Button>
                  ))}
                </div>

                {feedback && (
                  <Alert className={feedback === 'correct' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}>
                    <Icon name={feedback === 'correct' ? 'CheckCircle2' : 'XCircle'} 
                          className={feedback === 'correct' ? 'text-green-600' : 'text-red-600'} />
                    <AlertDescription className={feedback === 'correct' ? 'text-green-800' : 'text-red-800'}>
                      {feedback === 'correct' ? 'Отлично! Правильный ответ!' : `Неправильно. Правильный ответ: ${exercises[currentExercise].correctAnswer.toUpperCase()}`}
                    </AlertDescription>
                  </Alert>
                )}

                <Button
                  onClick={() => setShowHint(!showHint)}
                  variant="ghost"
                  className="w-full mt-4"
                  disabled={feedback !== null}
                >
                  <Icon name="Lightbulb" className="mr-2" />
                  {showHint ? 'Скрыть подсказку' : 'Показать подсказку'}
                </Button>

                {showHint && (
                  <div className="mt-4 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg animate-scale-in">
                    <p className="font-semibold text-yellow-900 mb-2">Подсказка:</p>
                    <ul className="text-sm text-yellow-800 space-y-1">
                      {rules[exercises[currentExercise].correctAnswer].map((rule, i) => (
                        <li key={i}>• {rule}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {view === 'results' && (
          <div className="animate-fade-in">
            <Card className="border-2 shadow-xl">
              <CardHeader className="text-center bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-t-lg py-8">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-4 mx-auto">
                  <Icon name="Trophy" size={40} />
                </div>
                <CardTitle className="text-4xl mb-2">Отличная работа!</CardTitle>
                <CardDescription className="text-purple-100 text-lg">
                  Ты завершил тренировку
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-8">
                <div className="text-center mb-8">
                  <div className="text-6xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
                    {score}/{exercises.length}
                  </div>
                  <p className="text-gray-600 text-lg">
                    Правильных ответов: {Math.round((score / exercises.length) * 100)}%
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-green-50 p-6 rounded-xl border-2 border-green-200 text-center">
                    <Icon name="CheckCircle2" size={32} className="text-green-500 mx-auto mb-2" />
                    <div className="text-3xl font-bold text-green-600">{score}</div>
                    <div className="text-sm text-gray-600">Правильно</div>
                  </div>
                  <div className="bg-red-50 p-6 rounded-xl border-2 border-red-200 text-center">
                    <Icon name="XCircle" size={32} className="text-red-500 mx-auto mb-2" />
                    <div className="text-3xl font-bold text-red-600">{exercises.length - score}</div>
                    <div className="text-sm text-gray-600">Неправильно</div>
                  </div>
                </div>

                <div className="space-y-3 mb-8">
                  {exercises.map((exercise, index) => (
                    <div
                      key={exercise.id}
                      className={`p-4 rounded-lg border-2 ${
                        answers[index]?.correct
                          ? 'bg-green-50 border-green-200'
                          : 'bg-red-50 border-red-200'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <Icon
                          name={answers[index]?.correct ? 'CheckCircle2' : 'XCircle'}
                          className={answers[index]?.correct ? 'text-green-600' : 'text-red-600'}
                          size={20}
                        />
                        <div className="flex-1">
                          <p className="text-gray-800 mb-1">
                            {exercise.sentence.replace('___', exercise.correctAnswer)}
                          </p>
                          {!answers[index]?.correct && (
                            <p className="text-sm text-red-700">
                              Твой ответ: <span className="font-semibold">{answers[index]?.answer.toUpperCase()}</span>
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-4">
                  <Button
                    onClick={startExercises}
                    size="lg"
                    className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                  >
                    <Icon name="RotateCcw" className="mr-2" />
                    Пройти снова
                  </Button>
                  <Button
                    onClick={() => setView('home')}
                    size="lg"
                    variant="outline"
                    className="flex-1"
                  >
                    <Icon name="Home" className="mr-2" />
                    На главную
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}