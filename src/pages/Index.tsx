import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import confetti from 'canvas-confetti';

interface Exercise {
  id: number;
  sentence: string;
  correctAnswer: 'at' | 'on' | 'in';
  options: Array<'at' | 'on' | 'in'>;
  ruleType: string;
}

const allExercises: Exercise[] = [
  { id: 1, sentence: 'I wake up ___ 7 AM every day', correctAnswer: 'at', options: ['at', 'on', 'in'], ruleType: 'at_exact_time' },
  { id: 2, sentence: 'My birthday is ___ March', correctAnswer: 'in', options: ['at', 'on', 'in'], ruleType: 'in_month' },
  { id: 3, sentence: 'We have a meeting ___ Monday', correctAnswer: 'on', options: ['at', 'on', 'in'], ruleType: 'on_day_of_week' },
  { id: 4, sentence: 'The concert starts ___ midnight', correctAnswer: 'at', options: ['at', 'on', 'in'], ruleType: 'at_exact_time' },
  { id: 5, sentence: 'She was born ___ 1995', correctAnswer: 'in', options: ['at', 'on', 'in'], ruleType: 'in_year' },
  { id: 6, sentence: 'Let\'s meet ___ Friday afternoon', correctAnswer: 'on', options: ['at', 'on', 'in'], ruleType: 'on_day_part' },
  { id: 7, sentence: 'I go to the gym ___ the evening', correctAnswer: 'in', options: ['at', 'on', 'in'], ruleType: 'in_part_of_day' },
  { id: 8, sentence: 'The store closes ___ 9 PM', correctAnswer: 'at', options: ['at', 'on', 'in'], ruleType: 'at_exact_time' },
  { id: 9, sentence: 'We usually travel ___ summer', correctAnswer: 'in', options: ['at', 'on', 'in'], ruleType: 'in_season' },
  { id: 10, sentence: 'The exam is ___ December 15th', correctAnswer: 'on', options: ['at', 'on', 'in'], ruleType: 'on_exact_date' },
  { id: 11, sentence: 'Classes start ___ September', correctAnswer: 'in', options: ['at', 'on', 'in'], ruleType: 'in_month' },
  { id: 12, sentence: 'The movie starts ___ 8:30 PM', correctAnswer: 'at', options: ['at', 'on', 'in'], ruleType: 'at_exact_time' },
  { id: 13, sentence: 'We celebrate ___ New Year\'s Eve', correctAnswer: 'on', options: ['at', 'on', 'in'], ruleType: 'on_exact_date' },
  { id: 14, sentence: 'I was born ___ 2000', correctAnswer: 'in', options: ['at', 'on', 'in'], ruleType: 'in_year' },
  { id: 15, sentence: 'The shop opens ___ sunrise', correctAnswer: 'at', options: ['at', 'on', 'in'], ruleType: 'at_moment' },
  { id: 16, sentence: 'We go skiing ___ winter', correctAnswer: 'in', options: ['at', 'on', 'in'], ruleType: 'in_season' },
  { id: 17, sentence: 'The party is ___ Saturday night', correctAnswer: 'on', options: ['at', 'on', 'in'], ruleType: 'on_day_part' },
  { id: 18, sentence: 'I study ___ the afternoon', correctAnswer: 'in', options: ['at', 'on', 'in'], ruleType: 'in_part_of_day' },
  { id: 19, sentence: 'We meet ___ noon for lunch', correctAnswer: 'at', options: ['at', 'on', 'in'], ruleType: 'at_exact_time' },
  { id: 20, sentence: 'Her wedding is ___ June 20th', correctAnswer: 'on', options: ['at', 'on', 'in'], ruleType: 'on_exact_date' },
  { id: 21, sentence: 'I\'ll see you ___ Christmas', correctAnswer: 'at', options: ['at', 'on', 'in'], ruleType: 'at_holiday' },
  { id: 22, sentence: 'The meeting is ___ Tuesday morning', correctAnswer: 'on', options: ['at', 'on', 'in'], ruleType: 'on_day_part' },
  { id: 23, sentence: 'She graduated ___ 2019', correctAnswer: 'in', options: ['at', 'on', 'in'], ruleType: 'in_year' },
  { id: 24, sentence: 'We arrived ___ night', correctAnswer: 'at', options: ['at', 'on', 'in'], ruleType: 'at_moment' },
  { id: 25, sentence: 'The conference is ___ April', correctAnswer: 'in', options: ['at', 'on', 'in'], ruleType: 'in_month' },
];

const rules = {
  at: ['Точное время: at 5 PM, at noon', 'Праздники: at Christmas, at Easter', 'Моменты дня: at night, at sunrise'],
  on: ['Дни недели: on Monday, on Friday', 'Даты: on March 15th', 'Части дней недели: on Monday morning'],
  in: ['Месяцы: in January', 'Годы: in 2024', 'Части дня: in the morning, in the evening', 'Сезоны: in summer']
};

type View = 'home' | 'settings' | 'exercise' | 'results' | 'statistics' | 'progress' | 'weaknesses';

interface TestResult {
  id: number;
  test_date: string;
  total_questions: number;
  correct_answers: number;
  score_percentage: number;
  prepositions: string[];
}

interface RuleStats {
  preposition: string;
  rule_type: string;
  total_attempts: number;
  correct_attempts: number;
  accuracy_percentage: number;
}

interface ErrorPattern {
  preposition: string;
  rule_type: string;
  error_count: number;
  sentence: string;
}

const ruleTypeNames: Record<string, string> = {
  'at_exact_time': 'AT - Точное время (7 PM, noon)',
  'at_moment': 'AT - Моменты дня (night, sunrise)',
  'at_holiday': 'AT - Праздники (Christmas, Easter)',
  'on_day_of_week': 'ON - Дни недели (Monday, Friday)',
  'on_exact_date': 'ON - Точные даты (March 15th)',
  'on_day_part': 'ON - День недели + часть дня (Monday morning)',
  'in_month': 'IN - Месяцы (January, March)',
  'in_year': 'IN - Годы (2024, 1995)',
  'in_part_of_day': 'IN - Части дня (morning, evening)',
  'in_season': 'IN - Сезоны (summer, winter)'
};

export default function Index() {
  const [view, setView] = useState<View>('home');
  const [currentExercise, setCurrentExercise] = useState(0);
  const [score, setScore] = useState(0);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [answers, setAnswers] = useState<Array<{ correct: boolean; answer: string; exercise: Exercise }>>([]);
  const [showHint, setShowHint] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [selectedPrepositions, setSelectedPrepositions] = useState<Array<'at' | 'on' | 'in'>>(['at', 'on', 'in']);
  const [questionCount, setQuestionCount] = useState(10);
  const [statistics, setStatistics] = useState<TestResult[]>([]);
  const [ruleStats, setRuleStats] = useState<RuleStats[]>([]);
  const [errorPatterns, setErrorPatterns] = useState<ErrorPattern[]>([]);
  const [loading, setLoading] = useState(false);
  const [smartMode, setSmartMode] = useState(false);

  useEffect(() => {
    if (view === 'statistics' || view === 'progress') {
      loadStatistics();
    } else if (view === 'weaknesses') {
      loadWeaknesses();
    }
  }, [view]);

  const API_URL = 'https://functions.poehali.dev/3e7d4a06-ed5a-4ec6-bb0b-1e22e0869e9d';

  const loadStatistics = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}?action=get_statistics`);
      if (response.ok) {
        const data = await response.json();
        setStatistics(data);
      }
    } catch (error) {
      console.error('Failed to load statistics:', error);
    }
    setLoading(false);
  };

  const loadWeaknesses = async () => {
    setLoading(true);
    try {
      const [statsResponse, errorsResponse] = await Promise.all([
        fetch(`${API_URL}?action=get_rule_stats`),
        fetch(`${API_URL}?action=get_error_patterns`)
      ]);
      
      if (statsResponse.ok) {
        const data = await statsResponse.json();
        setRuleStats(data);
      }
      if (errorsResponse.ok) {
        const data = await errorsResponse.json();
        setErrorPatterns(data);
      }
    } catch (error) {
      console.error('Failed to load weaknesses:', error);
    }
    setLoading(false);
  };

  const saveResult = async () => {
    try {
      const detailedAnswers = answers.map(a => ({
        sentence: a.exercise.sentence,
        correct: a.correct,
        answer: a.answer,
        correctAnswer: a.exercise.correctAnswer,
        ruleType: a.exercise.ruleType
      }));

      await fetch(`${API_URL}?action=save_result`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          total_questions: exercises.length,
          correct_answers: score,
          prepositions: selectedPrepositions,
          score_percentage: Math.round((score / exercises.length) * 100),
          answers: detailedAnswers
        })
      });
    } catch (error) {
      console.error('Failed to save result:', error);
    }
  };

  const goToSettings = () => {
    setView('settings');
  };

  const startSmartTraining = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}?action=get_rule_stats`);
      if (response.ok) {
        const stats: RuleStats[] = await response.json();
        
        const weakRules = stats
          .filter(s => s.accuracy_percentage < 70 && s.total_attempts >= 2)
          .sort((a, b) => a.accuracy_percentage - b.accuracy_percentage)
          .slice(0, 5)
          .map(s => s.rule_type);
        
        let selectedExercises = allExercises.filter(ex => 
          weakRules.includes(ex.ruleType) && 
          selectedPrepositions.includes(ex.correctAnswer)
        );
        
        if (selectedExercises.length < questionCount) {
          const additionalExercises = allExercises
            .filter(ex => 
              !weakRules.includes(ex.ruleType) && 
              selectedPrepositions.includes(ex.correctAnswer)
            )
            .sort(() => Math.random() - 0.5)
            .slice(0, questionCount - selectedExercises.length);
          
          selectedExercises = [...selectedExercises, ...additionalExercises];
        }
        
        setExercises(selectedExercises.sort(() => Math.random() - 0.5).slice(0, questionCount));
      } else {
        startExercises();
      }
    } catch (error) {
      console.error('Failed to start smart training:', error);
      startExercises();
    }
    setLoading(false);
    setView('exercise');
    setCurrentExercise(0);
    setScore(0);
    setAnswers([]);
    setFeedback(null);
    setShowHint(false);
  };

  const startExercises = () => {
    const filteredExercises = allExercises
      .filter(ex => selectedPrepositions.includes(ex.correctAnswer))
      .sort(() => Math.random() - 0.5)
      .slice(0, questionCount);

    setExercises(filteredExercises);
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

    setAnswers([...answers, { correct: isCorrect, answer, exercise: exercises[currentExercise] }]);
  };

  const nextQuestion = () => {
    if (currentExercise < exercises.length - 1) {
      setCurrentExercise(currentExercise + 1);
      setFeedback(null);
      setShowHint(false);
    } else {
      saveResult();
      setView('results');
    }
  };

  const togglePreposition = (prep: 'at' | 'on' | 'in') => {
    if (selectedPrepositions.includes(prep)) {
      if (selectedPrepositions.length > 1) {
        setSelectedPrepositions(selectedPrepositions.filter(p => p !== prep));
      }
    } else {
      setSelectedPrepositions([...selectedPrepositions, prep]);
    }
  };

  const progress = exercises.length > 0 ? ((currentExercise + 1) / exercises.length) * 100 : 0;

  const totalTests = statistics.length;
  const averageScore = totalTests > 0 
    ? Math.round(statistics.reduce((sum, s) => sum + s.score_percentage, 0) / totalTests) 
    : 0;
  const bestScore = totalTests > 0 
    ? Math.max(...statistics.map(s => s.score_percentage)) 
    : 0;

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
                  onClick={goToSettings}
                  size="lg"
                  className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-lg py-6"
                >
                  <Icon name="Play" className="mr-2" />
                  Начать тренировку
                </Button>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-5 gap-4">
              <Card className="hover-scale hover:shadow-lg transition-all cursor-pointer" onClick={() => setView('progress')}>
                <CardHeader className="pb-3">
                  <Icon name="Target" size={32} className="text-purple-500 mb-2" />
                  <CardTitle className="text-lg">Упражнения</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm">Интерактивные задания</p>
                </CardContent>
              </Card>
              <Card className="hover-scale hover:shadow-lg transition-all cursor-pointer" onClick={() => setView('weaknesses')}>
                <CardHeader className="pb-3">
                  <Icon name="AlertCircle" size={32} className="text-red-500 mb-2" />
                  <CardTitle className="text-lg">Слабые места</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm">Анализ ошибок</p>
                </CardContent>
              </Card>
              <Card className="hover-scale hover:shadow-lg transition-all cursor-pointer" onClick={() => setView('statistics')}>
                <CardHeader className="pb-3">
                  <Icon name="BarChart3" size={32} className="text-blue-500 mb-2" />
                  <CardTitle className="text-lg">Статистика</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm">История результатов</p>
                </CardContent>
              </Card>
              <Card className="hover-scale hover:shadow-lg transition-all cursor-pointer" onClick={() => setView('progress')}>
                <CardHeader className="pb-3">
                  <Icon name="TrendingUp" size={32} className="text-green-500 mb-2" />
                  <CardTitle className="text-lg">Прогресс</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm">Твой рост</p>
                </CardContent>
              </Card>
              <Card className="hover-scale hover:shadow-lg transition-all cursor-pointer" onClick={() => setView('settings')}>
                <CardHeader className="pb-3">
                  <Icon name="Settings" size={32} className="text-orange-500 mb-2" />
                  <CardTitle className="text-lg">Настройки</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm">Выбор тем</p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {view === 'settings' && (
          <div className="animate-fade-in">
            <Button variant="ghost" onClick={() => setView('home')} className="mb-6">
              <Icon name="ArrowLeft" className="mr-2" />
              Назад
            </Button>

            <Card className="border-2 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-3">
                  <Icon name="Settings" size={28} />
                  Настройки тренировки
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-8">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Выбери предлоги для тренировки:</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedPrepositions.includes('at') 
                        ? 'bg-orange-100 border-orange-400' 
                        : 'bg-gray-50 border-gray-200'
                    }`} onClick={() => togglePreposition('at')}>
                      <div className="flex items-center gap-3">
                        <Checkbox 
                          id="at" 
                          checked={selectedPrepositions.includes('at')}
                          onCheckedChange={() => togglePreposition('at')}
                        />
                        <Label htmlFor="at" className="text-lg font-bold cursor-pointer">AT</Label>
                      </div>
                    </div>
                    <div className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedPrepositions.includes('on') 
                        ? 'bg-blue-100 border-blue-400' 
                        : 'bg-gray-50 border-gray-200'
                    }`} onClick={() => togglePreposition('on')}>
                      <div className="flex items-center gap-3">
                        <Checkbox 
                          id="on" 
                          checked={selectedPrepositions.includes('on')}
                          onCheckedChange={() => togglePreposition('on')}
                        />
                        <Label htmlFor="on" className="text-lg font-bold cursor-pointer">ON</Label>
                      </div>
                    </div>
                    <div className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedPrepositions.includes('in') 
                        ? 'bg-purple-100 border-purple-400' 
                        : 'bg-gray-50 border-gray-200'
                    }`} onClick={() => togglePreposition('in')}>
                      <div className="flex items-center gap-3">
                        <Checkbox 
                          id="in" 
                          checked={selectedPrepositions.includes('in')}
                          onCheckedChange={() => togglePreposition('in')}
                        />
                        <Label htmlFor="in" className="text-lg font-bold cursor-pointer">IN</Label>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Количество вопросов:</h3>
                  <div className="grid grid-cols-4 gap-3">
                    {[5, 10, 15, 20].map(count => (
                      <Button
                        key={count}
                        variant={questionCount === count ? 'default' : 'outline'}
                        className={questionCount === count ? 'bg-gradient-to-r from-purple-500 to-blue-500' : ''}
                        onClick={() => setQuestionCount(count)}
                      >
                        {count}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  smartMode ? 'bg-blue-100 border-blue-400' : 'bg-gray-50 border-gray-200'
                }`} onClick={() => setSmartMode(!smartMode)}>
                  <div className="flex items-center gap-3">
                    <Checkbox 
                      id="smart" 
                      checked={smartMode}
                      onCheckedChange={(checked) => setSmartMode(!!checked)}
                    />
                    <div className="flex-1">
                      <Label htmlFor="smart" className="text-lg font-bold cursor-pointer flex items-center gap-2">
                        <Icon name="Brain" size={20} />
                        Умный режим
                      </Label>
                      <p className="text-sm text-gray-600 mt-1">Фокус на правилах, где больше ошибок</p>
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={smartMode ? startSmartTraining : startExercises}
                  size="lg"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-lg py-6"
                >
                  {loading ? (
                    <>Загрузка...</>
                  ) : (
                    <>
                      <Icon name={smartMode ? "Brain" : "Play"} className="mr-2" />
                      {smartMode ? 'Умная тренировка' : 'Начать'} ({questionCount} вопросов)
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {view === 'exercise' && exercises.length > 0 && (
          <div className="animate-fade-in">
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-600">
                  Вопрос {currentExercise + 1} из {exercises.length}
                </span>
                <span className="text-sm font-medium text-purple-600">
                  Счёт: {score}/{answers.length}
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
                  <div className="space-y-4">
                    <Alert className={feedback === 'correct' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}>
                      <Icon name={feedback === 'correct' ? 'CheckCircle2' : 'XCircle'} 
                            className={feedback === 'correct' ? 'text-green-600' : 'text-red-600'} />
                      <AlertDescription className={feedback === 'correct' ? 'text-green-800' : 'text-red-800'}>
                        {feedback === 'correct' ? 'Отлично! Правильный ответ!' : `Неправильно. Правильный ответ: ${exercises[currentExercise].correctAnswer.toUpperCase()}`}
                      </AlertDescription>
                    </Alert>
                    <Button
                      onClick={nextQuestion}
                      size="lg"
                      className="w-full bg-gradient-to-r from-purple-500 to-blue-500"
                    >
                      {currentExercise < exercises.length - 1 ? 'Следующий вопрос' : 'Завершить'}
                      <Icon name="ArrowRight" className="ml-2" />
                    </Button>
                  </div>
                )}

                {!feedback && (
                  <Button
                    onClick={() => setShowHint(!showHint)}
                    variant="ghost"
                    className="w-full mt-4"
                  >
                    <Icon name="Lightbulb" className="mr-2" />
                    {showHint ? 'Скрыть подсказку' : 'Показать подсказку'}
                  </Button>
                )}

                {showHint && !feedback && (
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
                    onClick={goToSettings}
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

        {view === 'statistics' && (
          <div className="animate-fade-in">
            <Button variant="ghost" onClick={() => setView('home')} className="mb-6">
              <Icon name="ArrowLeft" className="mr-2" />
              Назад
            </Button>

            <Card className="border-2 shadow-xl mb-6">
              <CardHeader className="bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-3">
                  <Icon name="BarChart3" size={28} />
                  Статистика
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-3 gap-4 mb-8">
                  <div className="bg-purple-50 p-6 rounded-xl border-2 border-purple-200 text-center">
                    <Icon name="Target" size={32} className="text-purple-500 mx-auto mb-2" />
                    <div className="text-3xl font-bold text-purple-600">{totalTests}</div>
                    <div className="text-sm text-gray-600">Всего тестов</div>
                  </div>
                  <div className="bg-blue-50 p-6 rounded-xl border-2 border-blue-200 text-center">
                    <Icon name="TrendingUp" size={32} className="text-blue-500 mx-auto mb-2" />
                    <div className="text-3xl font-bold text-blue-600">{averageScore}%</div>
                    <div className="text-sm text-gray-600">Средний результат</div>
                  </div>
                  <div className="bg-green-50 p-6 rounded-xl border-2 border-green-200 text-center">
                    <Icon name="Award" size={32} className="text-green-500 mx-auto mb-2" />
                    <div className="text-3xl font-bold text-green-600">{bestScore}%</div>
                    <div className="text-sm text-gray-600">Лучший результат</div>
                  </div>
                </div>

                {loading ? (
                  <div className="text-center py-8 text-gray-500">Загрузка...</div>
                ) : statistics.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Icon name="FileQuestion" size={48} className="mx-auto mb-4 text-gray-400" />
                    <p>Пока нет статистики. Пройди первый тест!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {statistics.slice(0, 10).map((stat, index) => (
                      <div key={stat.id} className="p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold">
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-800">
                                {stat.correct_answers}/{stat.total_questions} правильных
                              </p>
                              <p className="text-sm text-gray-500">
                                {new Date(stat.test_date).toLocaleDateString('ru-RU', {
                                  day: 'numeric',
                                  month: 'long',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex gap-1">
                              {stat.prepositions.map(prep => (
                                <Badge key={prep} className="text-xs">
                                  {prep.toUpperCase()}
                                </Badge>
                              ))}
                            </div>
                            <div className={`text-2xl font-bold ${
                              stat.score_percentage >= 80 ? 'text-green-600' :
                              stat.score_percentage >= 60 ? 'text-blue-600' :
                              'text-orange-600'
                            }`}>
                              {stat.score_percentage}%
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {view === 'weaknesses' && (
          <div className="animate-fade-in">
            <Button variant="ghost" onClick={() => setView('home')} className="mb-6">
              <Icon name="ArrowLeft" className="mr-2" />
              Назад
            </Button>

            <Card className="border-2 shadow-xl mb-6">
              <CardHeader className="bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-3">
                  <Icon name="AlertCircle" size={28} />
                  Слабые места - Анализ ошибок
                </CardTitle>
                <CardDescription className="text-red-100">
                  Работай над правилами, где чаще всего ошибаешься
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {loading ? (
                  <div className="text-center py-8 text-gray-500">Загрузка...</div>
                ) : ruleStats.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Icon name="CheckCircle2" size={48} className="mx-auto mb-4 text-gray-400" />
                    <p className="mb-4">Пройди несколько тестов, чтобы увидеть анализ</p>
                    <Button onClick={goToSettings} className="bg-gradient-to-r from-purple-500 to-blue-500">
                      <Icon name="Play" className="mr-2" />
                      Начать тренировку
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Icon name="TrendingDown" className="text-red-500" />
                        Правила требующие внимания:
                      </h3>
                      <div className="space-y-3">
                        {ruleStats
                          .filter(s => s.accuracy_percentage < 80)
                          .slice(0, 8)
                          .map((stat, index) => (
                            <div key={index} className="p-4 bg-red-50 rounded-lg border-2 border-red-200">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex-1">
                                  <p className="font-semibold text-gray-800">
                                    {ruleTypeNames[stat.rule_type] || stat.rule_type}
                                  </p>
                                  <p className="text-sm text-gray-600 mt-1">
                                    {stat.correct_attempts} из {stat.total_attempts} правильных попыток
                                  </p>
                                </div>
                                <div className={`text-3xl font-bold ${
                                  stat.accuracy_percentage >= 60 ? 'text-orange-600' : 'text-red-600'
                                }`}>
                                  {stat.accuracy_percentage}%
                                </div>
                              </div>
                              <Progress value={stat.accuracy_percentage} className="h-2" />
                            </div>
                          ))}
                      </div>
                    </div>

                    {ruleStats.filter(s => s.accuracy_percentage >= 80).length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                          <Icon name="CheckCircle2" className="text-green-500" />
                          Освоенные правила:
                        </h3>
                        <div className="grid md:grid-cols-2 gap-3">
                          {ruleStats
                            .filter(s => s.accuracy_percentage >= 80)
                            .map((stat, index) => (
                              <div key={index} className="p-3 bg-green-50 rounded-lg border-2 border-green-200 flex items-center justify-between">
                                <div className="flex-1">
                                  <p className="font-medium text-gray-800 text-sm">
                                    {ruleTypeNames[stat.rule_type] || stat.rule_type}
                                  </p>
                                  <p className="text-xs text-gray-600">
                                    {stat.total_attempts} попыток
                                  </p>
                                </div>
                                <div className="text-xl font-bold text-green-600">
                                  {stat.accuracy_percentage}%
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}

                    <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                      <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                        <Icon name="Lightbulb" size={20} />
                        Рекомендация:
                      </h3>
                      <p className="text-blue-800 text-sm mb-3">
                        Используй "Умный режим" в настройках для автоматического подбора упражнений на слабые правила
                      </p>
                      <Button 
                        onClick={() => { setSmartMode(true); goToSettings(); }}
                        className="bg-blue-500 hover:bg-blue-600"
                      >
                        <Icon name="Brain" className="mr-2" />
                        Включить умный режим
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {view === 'progress' && (
          <div className="animate-fade-in">
            <Button variant="ghost" onClick={() => setView('home')} className="mb-6">
              <Icon name="ArrowLeft" className="mr-2" />
              Назад
            </Button>

            <Card className="border-2 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-3">
                  <Icon name="TrendingUp" size={28} />
                  Твой прогресс
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-3 gap-4 mb-8">
                  <div className="bg-purple-50 p-6 rounded-xl border-2 border-purple-200 text-center">
                    <Icon name="Zap" size={32} className="text-purple-500 mx-auto mb-2" />
                    <div className="text-3xl font-bold text-purple-600">{totalTests}</div>
                    <div className="text-sm text-gray-600">Тестов пройдено</div>
                  </div>
                  <div className="bg-blue-50 p-6 rounded-xl border-2 border-blue-200 text-center">
                    <Icon name="Award" size={32} className="text-blue-500 mx-auto mb-2" />
                    <div className="text-3xl font-bold text-blue-600">{averageScore}%</div>
                    <div className="text-sm text-gray-600">Средняя точность</div>
                  </div>
                  <div className="bg-green-50 p-6 rounded-xl border-2 border-green-200 text-center">
                    <Icon name="Trophy" size={32} className="text-green-500 mx-auto mb-2" />
                    <div className="text-3xl font-bold text-green-600">{bestScore}%</div>
                    <div className="text-sm text-gray-600">Лучший результат</div>
                  </div>
                </div>

                {loading ? (
                  <div className="text-center py-8 text-gray-500">Загрузка...</div>
                ) : statistics.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Icon name="Target" size={48} className="mx-auto mb-4 text-gray-400" />
                    <p className="mb-4">Начни тренировки, чтобы увидеть свой прогресс!</p>
                    <Button onClick={goToSettings} className="bg-gradient-to-r from-purple-500 to-blue-500">
                      <Icon name="Play" className="mr-2" />
                      Начать тренировку
                    </Button>
                  </div>
                ) : (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Последние результаты:</h3>
                    <div className="space-y-2">
                      {statistics.slice(0, 5).map((stat) => (
                        <div key={stat.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <Icon name="Calendar" size={20} className="text-gray-400" />
                          <div className="flex-1">
                            <p className="text-sm text-gray-600">
                              {new Date(stat.test_date).toLocaleDateString('ru-RU', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                          <Progress value={stat.score_percentage} className="w-32" />
                          <span className="font-bold text-purple-600">{stat.score_percentage}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}