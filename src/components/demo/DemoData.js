// Demo data for testing without backend
export const demoUser = {
  _id: 'demo-user-123',
  email: 'demo@wellsense.ai',
  profile: {
    firstName: 'John',
    lastName: 'Doe',
    dateOfBirth: new Date('1990-05-15'),
    gender: 'male',
    height: 175,
    weight: 75,
    activityLevel: 'moderately_active'
  },
  healthMetrics: {
    bmi: 24.5,
    currentWeight: 75
  },
  healthScore: 85,
  streakDays: 12,
  totalPoints: 2398,
  goals: [
    { type: 'weight_loss', target: 'Lose 5kg', progress: 60, status: 'active' },
    { type: 'fitness', target: '10,000 steps daily', progress: 85, status: 'active' },
    { type: 'nutrition', target: 'Eat 5 servings of fruits/vegetables', progress: 70, status: 'active' }
  ],
  achievements: [
    { id: '1', title: 'Step Master', description: '100,000 steps milestone', icon: '🏃‍♂️', earnedAt: new Date() },
    { id: '2', title: 'Heart Healthy', description: '30 days of cardio', icon: '❤️', earnedAt: new Date() },
    { id: '3', title: 'Sleep Champion', description: 'Perfect sleep score for a week', icon: '😴', earnedAt: new Date() }
  ]
};

export const demoHealthData = [
  { name: 'Mon', steps: 8500, heartRate: 72, sleep: 7.5, weight: 75.2 },
  { name: 'Tue', steps: 9200, heartRate: 75, sleep: 8.0, weight: 75.1 },
  { name: 'Wed', steps: 7800, heartRate: 70, sleep: 6.5, weight: 75.0 },
  { name: 'Thu', steps: 10500, heartRate: 78, sleep: 7.8, weight: 74.9 },
  { name: 'Fri', steps: 9800, heartRate: 74, sleep: 8.2, weight: 74.8 },
  { name: 'Sat', steps: 12000, heartRate: 76, sleep: 9.0, weight: 74.7 },
  { name: 'Sun', steps: 6500, heartRate: 68, sleep: 8.5, weight: 74.6 },
];

export const demoInsights = [
  {
    type: 'positive',
    title: 'Cardiovascular Improvement',
    description: 'Your resting heart rate has decreased by 5 BPM over the past month, indicating improved cardiovascular fitness.',
    confidence: 92,
    color: 'green'
  },
  {
    type: 'warning',
    title: 'Hydration Pattern',
    description: 'You tend to drink less water on weekends. Consider setting reminders to maintain consistent hydration.',
    confidence: 78,
    color: 'yellow'
  },
  {
    type: 'suggestion',
    title: 'Optimal Exercise Time',
    description: 'Based on your energy levels and heart rate data, 2-4 PM appears to be your optimal workout window.',
    confidence: 85,
    color: 'blue'
  }
];

export const demoCommunityPosts = [
  {
    id: 1,
    author: { profile: { firstName: 'Sarah', lastName: 'Johnson' } },
    title: 'Completed my first 10K run!',
    content: 'Just finished my first 10K run! The training plan from the AI coach really worked. Feeling amazing! 🏃‍♀️',
    category: 'fitness',
    likes: [],
    comments: [],
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    likeCount: 24,
    commentCount: 8,
    isLikedByUser: false
  },
  {
    id: 2,
    author: { profile: { firstName: 'Mike', lastName: 'Chen' } },
    title: 'Meditation Journey - Week 3',
    content: 'Week 3 of my meditation journey. My stress levels have dropped significantly according to my health metrics. Anyone else seeing similar results?',
    category: 'mental_health',
    likes: [],
    comments: [],
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
    likeCount: 18,
    commentCount: 12,
    isLikedByUser: true
  },
  {
    id: 3,
    author: { profile: { firstName: 'Emma', lastName: 'Davis' } },
    title: 'Healthy Meal Prep Success!',
    content: 'Sharing my healthy meal prep for the week! The AI nutritionist suggested these recipes based on my health goals. Recipe in comments! 🥗',
    category: 'nutrition',
    likes: [],
    comments: [],
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
    likeCount: 31,
    commentCount: 15,
    isLikedByUser: false
  }
];

export const demoWeightData = [
  { date: '2024-01-01', weight: 85.0, waterIntake: 7.5, dietScore: 70, calories: 2200 },
  { date: '2024-01-08', weight: 84.5, waterIntake: 7.8, dietScore: 75, calories: 2100 },
  { date: '2024-01-15', weight: 84.2, waterIntake: 8.0, dietScore: 80, calories: 2050 },
  { date: '2024-01-22', weight: 83.8, waterIntake: 8.2, dietScore: 82, calories: 2000 },
  { date: '2024-01-29', weight: 83.5, waterIntake: 8.3, dietScore: 85, calories: 1950 },
  { date: '2024-02-05', weight: 83.0, waterIntake: 8.5, dietScore: 88, calories: 1900 },
  { date: '2024-02-12', weight: 82.7, waterIntake: 8.4, dietScore: 90, calories: 1850 },
  { date: '2024-02-19', weight: 82.3, waterIntake: 8.6, dietScore: 87, calories: 1900 },
  { date: '2024-02-26', weight: 82.0, waterIntake: 8.7, dietScore: 92, calories: 1800 },
  { date: '2024-03-05', weight: 81.5, waterIntake: 8.8, dietScore: 95, calories: 1750 },
];

export const demoChatMessages = [
  {
    role: 'assistant',
    content: 'Hello John! I\'m your AI health coach. I\'ve reviewed your recent health data and I\'m impressed with your progress! How can I help you today?',
    timestamp: new Date(Date.now() - 10 * 60 * 1000)
  },
  {
    role: 'user',
    content: 'Hi! I\'ve been feeling a bit tired lately despite getting good sleep. Any suggestions?',
    timestamp: new Date(Date.now() - 8 * 60 * 1000)
  },
  {
    role: 'assistant',
    content: 'I understand your concern about fatigue. Looking at your data, your sleep duration is good at 8+ hours, but let me suggest a few things to check:\n\n1. **Hydration**: Are you drinking enough water throughout the day?\n2. **Iron levels**: Consider getting blood work done to check for iron deficiency\n3. **Stress levels**: Even with good sleep, high stress can cause fatigue\n4. **Exercise timing**: Try morning workouts to boost energy\n\nWould you like me to create a personalized energy-boosting plan for you?',
    timestamp: new Date(Date.now() - 7 * 60 * 1000)
  }
];