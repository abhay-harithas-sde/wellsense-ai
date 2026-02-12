# AI Training Guide - WellSense AI

## Overview

WellSense AI supports training with personalized data to provide customized health and nutrition advice. This guide covers how to train the AI with your own data.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Training with Diet Charts](#training-with-diet-charts)
3. [Training Data Format](#training-data-format)
4. [Advanced Training](#advanced-training)
5. [Verification & Testing](#verification--testing)

---

## Quick Start

### Train with Excel Diet Chart

```bash
# Basic usage
node scripts/train-diet-ai.js "path/to/your-diet-chart.xlsx"

# Example
node scripts/train-diet-ai.js "C:\Users\abhay\Downloads\Customized Diet Chart.xlsx"
```

That's it! The AI will automatically use your personalized data.

---

## Training with Diet Charts

### Step 1: Prepare Your Excel File

Your Excel file can have various formats. The script supports:

**Format A: Time-based columns**
```
| 6am          | 7:30am       | 12:00pm      | 4pm          |
|--------------|--------------|--------------|--------------|
| Warm water   | Breakfast    | Lunch        | Snack        |
| 1 ltr        | Oats 50g     | Rice 100g    | Fruits       |
```

**Format B: Row-based meals**
```
| Meal Type | Food Item    | Quantity | Calories | Protein | Carbs | Fat |
|-----------|--------------|----------|----------|---------|-------|-----|
| Breakfast | Oats         | 50g      | 190      | 7       | 32    | 3   |
| Lunch     | Rice         | 100g     | 130      | 2.7     | 28    | 0.3 |
```

**Format C: Mixed format**
```
| Time      | Meal Details                                    |
|-----------|-------------------------------------------------|
| 7:00 AM   | Oats 50g, Milk 200ml, Banana 1 medium          |
| 12:00 PM  | Rice 100g, Dal 50g, Vegetables 200g            |
```

### Step 2: Run Training Script

```bash
node scripts/train-diet-ai.js "path/to/your-file.xlsx"
```

**Output:**
```
📊 Reading diet chart from: your-file.xlsx
✅ Loaded 31 rows from Excel file
📋 Parsing Excel structure...
✅ Parsed 127 food items
✅ Created 14 meal plans
✅ Training data saved to: lib/training-data/diet-plans.json

📈 Training Summary:
- Meal plans: 14
- Nutrition guidelines: 8
- Food items: 127

✅ AI training completed successfully!
```

### Step 3: Verify Training

Check the generated training data:

```bash
# View training data
cat lib/training-data/diet-plans.json

# Or on Windows
type lib\training-data\diet-plans.json
```

### Step 4: Test the AI

Start your server and ask nutrition questions:

```bash
npm start
```

Then ask the AI:
- "What should I eat for breakfast?"
- "Show me my meal plan for today"
- "What are my daily nutrition targets?"

---

## Training Data Format

### Generated JSON Structure

```json
{
  "version": "1.0.0",
  "createdAt": "2026-02-12T03:57:47.171Z",
  "source": "Customized Diet Chart",
  
  "userProfile": {
    "name": "User Name",
    "age": 25,
    "weight": 70,
    "height": 175,
    "goal": "Weight loss"
  },
  
  "mealPlans": [
    {
      "mealType": "breakfast",
      "recommendedTime": "7:00 AM",
      "items": [
        {
          "name": "Oats",
          "quantity": "50g",
          "calories": 190,
          "protein": 7,
          "carbs": 32,
          "fat": 3
        }
      ],
      "totalNutrition": {
        "calories": 190,
        "protein": 7,
        "carbs": 32,
        "fat": 3
      }
    }
  ],
  
  "foodDatabase": [
    {
      "name": "Oats",
      "calories": 190,
      "protein": 7,
      "carbs": 32,
      "fat": 3,
      "category": "breakfast"
    }
  ],
  
  "nutritionTargets": {
    "daily": {
      "calories": 2000,
      "protein": 150,
      "carbs": 200,
      "fat": 65
    },
    "perMeal": {
      "breakfast": 600,
      "lunch": 700,
      "snack": 200,
      "dinner": 500
    }
  },
  
  "guidelines": [
    "Follow meal timings consistently",
    "Drink 8-10 glasses of water daily",
    "Include protein in every meal"
  ]
}
```

---

## Advanced Training

### Custom Training Script

Create your own training script for specific data formats:

```javascript
const fs = require('fs');
const path = require('path');

// Your custom data
const customTrainingData = {
  version: '1.0.0',
  createdAt: new Date().toISOString(),
  source: 'Custom Training Data',
  
  userProfile: {
    name: 'Your Name',
    age: 25,
    weight: 70,
    goals: 'Build muscle'
  },
  
  mealPlans: [
    {
      mealType: 'breakfast',
      recommendedTime: '7:00 AM',
      items: [
        {
          name: 'Eggs',
          quantity: '3 whole',
          calories: 210,
          protein: 18,
          carbs: 2,
          fat: 15
        }
      ]
    }
  ],
  
  guidelines: [
    'Eat protein with every meal',
    'Stay hydrated'
  ]
};

// Save training data
const outputPath = path.join(__dirname, '../lib/training-data/diet-plans.json');
fs.writeFileSync(outputPath, JSON.stringify(customTrainingData, null, 2));

console.log('✅ Custom training data saved!');
```

### Training with JSON Files

If you already have JSON data:

```bash
# Copy your JSON file to the training data directory
cp your-data.json lib/training-data/diet-plans.json
```

### Training with CSV Files

Convert CSV to JSON first:

```javascript
const fs = require('fs');
const csv = require('csv-parser');

const results = [];

fs.createReadStream('diet-data.csv')
  .pipe(csv())
  .on('data', (data) => results.push(data))
  .on('end', () => {
    // Convert to training format
    const trainingData = {
      version: '1.0.0',
      mealPlans: results.map(row => ({
        mealType: row.meal_type,
        items: [{
          name: row.food_name,
          quantity: row.quantity,
          calories: parseFloat(row.calories),
          protein: parseFloat(row.protein)
        }]
      }))
    };
    
    fs.writeFileSync(
      'lib/training-data/diet-plans.json',
      JSON.stringify(trainingData, null, 2)
    );
  });
```

---

## Verification & Testing

### 1. Check Training Data Exists

```bash
# Linux/Mac
ls -la lib/training-data/

# Windows
dir lib\training-data\
```

You should see `diet-plans.json`.

### 2. Validate JSON Format

```bash
node -e "console.log(JSON.parse(require('fs').readFileSync('lib/training-data/diet-plans.json')))"
```

### 3. Test AI Loading

Check server logs when starting:

```bash
npm start
```

Look for:
```
✅ Loaded personalized diet training data
```

### 4. Test AI Responses

Ask the AI nutrition questions and verify it references your training data:

**Good Response Indicators:**
- Mentions specific foods from your diet chart
- References your meal timings
- Suggests alternatives from your food database
- Compares with your nutrition targets

**Example:**
```
User: "What should I eat for breakfast?"

AI: "Based on your customized diet plan, I recommend having oats (50g) 
with milk at 7:00 AM. This provides 190 calories with 7g protein, which 
aligns with your breakfast target of 600 calories."
```

### 5. Debug Training Issues

If AI doesn't use training data:

```javascript
// Add to lib/ai.js temporarily
const trainingData = this.loadDietTrainingData();
console.log('Training data loaded:', trainingData ? 'YES' : 'NO');
if (trainingData) {
  console.log('Meal plans:', trainingData.mealPlans?.length);
  console.log('Food items:', trainingData.foodDatabase?.length);
}
```

---

## Training Best Practices

### 1. Data Quality
- ✅ Include accurate nutritional information
- ✅ Use consistent units (grams, ml, etc.)
- ✅ Specify meal timings
- ✅ Add variety of foods
- ❌ Avoid duplicate entries
- ❌ Don't leave critical fields empty

### 2. Update Frequency
- Retrain when diet plan changes
- Update quarterly for seasonal foods
- Refresh after major lifestyle changes

### 3. Backup Training Data
```bash
# Backup before retraining
cp lib/training-data/diet-plans.json lib/training-data/diet-plans.backup.json
```

### 4. Version Control
- Keep training data in version control
- Document changes in commit messages
- Tag major training updates

---

## Troubleshooting

### Issue: "No training data found"

**Solution:**
```bash
# Check if file exists
ls lib/training-data/diet-plans.json

# If missing, retrain
node scripts/train-diet-ai.js "path/to/diet-chart.xlsx"
```

### Issue: "Training data parsed incorrectly"

**Solution:**
1. Check Excel file format
2. Ensure data is in first sheet
3. Verify column structure
4. Try manual JSON creation

### Issue: "AI not using training data"

**Solution:**
1. Restart server to reload data
2. Check file permissions
3. Verify JSON is valid
4. Check server logs for errors

### Issue: "Excel file not found"

**Solution:**
```bash
# Use absolute path
node scripts/train-diet-ai.js "C:\Users\YourName\Downloads\diet-chart.xlsx"

# Or copy file to project
cp "path/to/diet-chart.xlsx" ./diet-chart.xlsx
node scripts/train-diet-ai.js "./diet-chart.xlsx"
```

---

## API Integration

### Programmatic Training

```javascript
const { processDietChart } = require('./scripts/train-diet-ai');

async function trainAI() {
  try {
    const trainingData = await processDietChart('path/to/diet-chart.xlsx');
    console.log('Training complete:', trainingData);
  } catch (error) {
    console.error('Training failed:', error);
  }
}

trainAI();
```

### REST API Endpoint (Future)

```javascript
// POST /api/ai/train
app.post('/api/ai/train', upload.single('dietChart'), async (req, res) => {
  try {
    const filePath = req.file.path;
    const trainingData = await processDietChart(filePath);
    res.json({ success: true, data: trainingData });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
```

---

## Examples

### Example 1: Simple Diet Chart

```bash
node scripts/train-diet-ai.js "simple-diet.xlsx"
```

### Example 2: Detailed Nutrition Plan

```bash
node scripts/train-diet-ai.js "detailed-nutrition-plan.xlsx"
```

### Example 3: Multiple Users

```bash
# Train for user 1
node scripts/train-diet-ai.js "user1-diet.xlsx"
mv lib/training-data/diet-plans.json lib/training-data/user1-diet.json

# Train for user 2
node scripts/train-diet-ai.js "user2-diet.xlsx"
mv lib/training-data/diet-plans.json lib/training-data/user2-diet.json
```

---

## Summary

**To train the AI:**

1. Prepare Excel file with your diet data
2. Run: `node scripts/train-diet-ai.js "path/to/file.xlsx"`
3. Verify: Check `lib/training-data/diet-plans.json`
4. Test: Ask AI nutrition questions
5. Enjoy personalized AI advice!

**Key Files:**
- Training Script: `scripts/train-diet-ai.js`
- Training Data: `lib/training-data/diet-plans.json`
- AI Module: `lib/ai.js`

**Support:**
- Check logs for errors
- Verify JSON format
- Ensure file permissions
- Restart server after training

---

**Happy Training! 🚀**
