const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

/**
 * Train AI with customized diet chart data
 * Processes Excel file and creates training data for personalized nutrition advice
 */

async function processDietChart(filePath) {
  try {
    console.log('📊 Reading diet chart from:', filePath);
    
    // Read the Excel file
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    console.log(`✅ Loaded ${data.length} rows from Excel file`);
    
    // Parse the diet chart structure
    const dietData = parseDietChart(data);
    
    // Create training data structure
    const trainingData = createTrainingData(dietData);
    
    // Save training data
    const outputPath = path.join(__dirname, '../lib/training-data/diet-plans.json');
    const outputDir = path.dirname(outputPath);
    
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    fs.writeFileSync(outputPath, JSON.stringify(trainingData, null, 2));
    
    console.log('✅ Training data saved to:', outputPath);
    console.log('\n📈 Training Summary:');
    console.log(`- Meal plans: ${trainingData.mealPlans?.length || 0}`);
    console.log(`- Nutrition guidelines: ${trainingData.guidelines?.length || 0}`);
    console.log(`- Food items: ${trainingData.foodDatabase?.length || 0}`);
    
    return trainingData;
    
  } catch (error) {
    console.error('❌ Error processing diet chart:', error.message);
    throw error;
  }
}

function parseDietChart(data) {
  const dietData = {
    userProfile: {
      name: 'Abhay Harithas',
      source: 'Customized Diet Chart'
    },
    mealPlans: [],
    nutritionGuidelines: [],
    foodItems: []
  };
  
  console.log('\n📋 Parsing Excel structure...');
  console.log('Detected format: Time-based columns\n');
  
  // Parse time-based structure
  // Row 0 contains times, subsequent rows contain meal details
  const timeRow = data[0] || [];
  const meals = [];
  
  // Create meal slots for each time
  timeRow.forEach((time, colIndex) => {
    if (time && String(time).trim()) {
      const timeStr = String(time).trim();
      const mealType = determineMealType(timeStr);
      meals.push({
        time: timeStr,
        type: mealType,
        items: [],
        columnIndex: colIndex
      });
    }
  });
  
  console.log(`Found ${meals.length} meal times:`, meals.map(m => `${m.time} (${m.type})`).join(', '));
  
  // Parse meal content from subsequent rows
  for (let rowIndex = 1; rowIndex < data.length; rowIndex++) {
    const row = data[rowIndex];
    if (!row) continue;
    
    meals.forEach(meal => {
      const cellContent = row[meal.columnIndex];
      if (cellContent && String(cellContent).trim()) {
        const content = String(cellContent).trim();
        
        // Parse the content for food items
        const items = parseMealContent(content);
        items.forEach(item => {
          item.mealType = meal.type;
          item.time = meal.time;
          meal.items.push(item);
          dietData.foodItems.push(item);
        });
      }
    });
  }
  
  // Convert meals to meal plans
  dietData.mealPlans = meals.filter(m => m.items.length > 0);
  
  // Extract nutrition data if present
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    if (!row) continue;
    
    const firstCell = String(row[0] || '').toLowerCase();
    if (firstCell.includes('protein') && row[3]) {
      dietData.userProfile.proteinTarget = parseFloat(row[3]) || 0;
    }
  }
  
  console.log(`\n✅ Parsed ${dietData.foodItems.length} food items`);
  console.log(`✅ Created ${dietData.mealPlans.length} meal plans`);
  
  return dietData;
}

function determineMealType(timeStr) {
  const time = timeStr.toLowerCase();
  const hour = parseInt(time.match(/\d+/)?.[0] || '0');
  
  if (time.includes('6') || time.includes('7') || time.includes('8')) return 'breakfast';
  if (time.includes('9') || time.includes('10')) return 'mid-morning';
  if (time.includes('12') || time.includes('1') && time.includes('pm')) return 'lunch';
  if (time.includes('4') || time.includes('5')) return 'snack';
  if (time.includes('7') || time.includes('8') && time.includes('pm')) return 'dinner';
  
  return 'general';
}

function parseMealContent(content) {
  const items = [];
  
  // Split by common separators
  const parts = content.split(/[,&\n]+/).map(s => s.trim()).filter(s => s);
  
  parts.forEach(part => {
    // Extract quantity and name
    const match = part.match(/(\d+(?:\.\d+)?)\s*(gms?|ml|ltrs?|spoons?|scoops?|medium|small|large)?\s*(.+)/i);
    
    if (match) {
      const [, quantity, unit, name] = match;
      items.push({
        name: name.trim() || part,
        quantity: `${quantity} ${unit || ''}`.trim(),
        calories: estimateCalories(name, quantity, unit),
        protein: 0,
        carbs: 0,
        fat: 0
      });
    } else if (part.length > 3) {
      // Add as is if it looks like a food item
      items.push({
        name: part,
        quantity: '',
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0
      });
    }
  });
  
  return items;
}

function estimateCalories(name, quantity, unit) {
  // Basic calorie estimation
  const lowerName = (name || '').toLowerCase();
  const qty = parseFloat(quantity) || 0;
  
  if (lowerName.includes('water')) return 0;
  if (lowerName.includes('protein powder')) return qty * 120;
  if (lowerName.includes('veg') || lowerName.includes('vegetable')) return qty * 0.5;
  if (lowerName.includes('paneer')) return qty * 2.5;
  if (lowerName.includes('coconut')) return 150;
  if (lowerName.includes('seeds')) return qty * 50;
  
  return 0;
}

function getMealTime(mealType) {
  const times = {
    breakfast: '7:00 AM',
    'mid-morning': '10:00 AM',
    lunch: '12:30 PM',
    snack: '4:00 PM',
    'evening-snack': '5:00 PM',
    dinner: '7:30 PM',
    general: 'Anytime'
  };
  return times[mealType] || 'Flexible';
}

function createTrainingData(dietData) {
  return {
    version: '1.0.0',
    createdAt: new Date().toISOString(),
    source: 'Customized Diet Chart',
    
    userProfile: dietData.userProfile,
    
    mealPlans: dietData.mealPlans.map(meal => ({
      mealType: meal.type,
      recommendedTime: meal.time,
      items: meal.items,
      totalNutrition: calculateTotalNutrition(meal.items)
    })),
    
    guidelines: [
      'Follow meal timings consistently for better metabolism',
      'Drink 8-10 glasses of water throughout the day',
      'Include protein in every meal for satiety',
      'Choose whole grains over refined carbohydrates',
      'Add colorful vegetables for micronutrients',
      'Limit processed foods and added sugars',
      'Practice portion control',
      'Eat slowly and mindfully'
    ],
    
    foodDatabase: dietData.foodItems,
    
    nutritionTargets: calculateNutritionTargets(dietData.mealPlans),
    
    aiPrompts: generateAIPrompts(dietData)
  };
}

function calculateTotalNutrition(items) {
  return items.reduce((total, item) => ({
    calories: total.calories + (parseFloat(item.calories) || 0),
    protein: total.protein + (parseFloat(item.protein) || 0),
    carbs: total.carbs + (parseFloat(item.carbs) || 0),
    fat: total.fat + (parseFloat(item.fat) || 0)
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
}

function calculateNutritionTargets(mealPlans) {
  const dailyTotal = mealPlans.reduce((total, meal) => {
    const mealNutrition = calculateTotalNutrition(meal.items);
    return {
      calories: total.calories + mealNutrition.calories,
      protein: total.protein + mealNutrition.protein,
      carbs: total.carbs + mealNutrition.carbs,
      fat: total.fat + mealNutrition.fat
    };
  }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
  
  return {
    daily: dailyTotal,
    perMeal: {
      breakfast: Math.round(dailyTotal.calories * 0.30),
      lunch: Math.round(dailyTotal.calories * 0.35),
      snack: Math.round(dailyTotal.calories * 0.10),
      dinner: Math.round(dailyTotal.calories * 0.25)
    }
  };
}

function generateAIPrompts(dietData) {
  return {
    systemPrompt: `You are a personalized nutrition AI trained on a customized diet plan. 
    
Your knowledge includes:
- Specific meal plans with timing and portions
- Detailed nutritional information for each food item
- Personalized recommendations based on user profile
- Evidence-based nutrition guidelines

When providing advice:
1. Reference the trained meal plans and food database
2. Consider user's specific nutritional targets
3. Suggest alternatives from the food database
4. Maintain consistency with the customized diet chart
5. Provide practical, actionable recommendations`,

    exampleQueries: [
      'What should I eat for breakfast?',
      'How many calories should I consume daily?',
      'Can you suggest a high-protein snack?',
      'What are good alternatives for lunch?',
      'How can I meet my protein goals?'
    ],
    
    responseTemplates: {
      mealSuggestion: 'Based on your customized diet plan, I recommend: [meal items]. This provides [calories] kcal with [protein]g protein, [carbs]g carbs, and [fat]g fat.',
      nutritionAdvice: 'Your daily target is [calories] kcal. Focus on: [key recommendations].',
      foodAlternative: 'Instead of [food], you can try: [alternatives] which have similar nutritional value.'
    }
  };
}

// Main execution
if (require.main === module) {
  const filePath = process.argv[2] || 'C:\\Users\\abhay\\Downloads\\Customized Diet Chart for Abhay Harithas.xlsx';
  
  processDietChart(filePath)
    .then(() => {
      console.log('\n✅ AI training completed successfully!');
      console.log('💡 The AI can now provide personalized nutrition advice based on your diet chart.');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Training failed:', error);
      process.exit(1);
    });
}

module.exports = { processDietChart };
