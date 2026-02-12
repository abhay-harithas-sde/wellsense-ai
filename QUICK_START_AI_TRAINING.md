# Quick Start: AI Training

## Train AI in 3 Steps

### 1. Prepare Your Diet Chart (Excel)
- Any format works (time-based, row-based, or mixed)
- Include food names, quantities, and nutritional info
- Save as `.xlsx` file

### 2. Run Training Command
```bash
node scripts/train-diet-ai.js "path/to/your-diet-chart.xlsx"
```

**Example:**
```bash
node scripts/train-diet-ai.js "C:\Users\abhay\Downloads\Customized Diet Chart.xlsx"
```

### 3. Start Using AI
```bash
npm start
```

Ask questions like:
- "What should I eat for breakfast?"
- "Show me my meal plan"
- "What are my nutrition targets?"

---

## What Gets Trained

✅ Your personalized meal plans  
✅ Food database with nutritional info  
✅ Meal timings and schedules  
✅ Daily nutrition targets  
✅ Dietary guidelines  

---

## Training Output

```
📊 Reading diet chart...
✅ Loaded 31 rows from Excel file
✅ Parsed 127 food items
✅ Created 14 meal plans
✅ Training data saved

📈 Training Summary:
- Meal plans: 14
- Food items: 127
- Guidelines: 8

✅ AI training completed successfully!
```

---

## Verify Training

**Check training data exists:**
```bash
# Windows
type lib\training-data\diet-plans.json

# Linux/Mac
cat lib/training-data/diet-plans.json
```

**Check AI loads it:**
Look for this in server logs:
```
✅ Loaded personalized diet training data
```

---

## Retrain Anytime

Update your diet chart and retrain:
```bash
node scripts/train-diet-ai.js "new-diet-chart.xlsx"
```

The AI will automatically use the new data!

---

## Need Help?

📖 Full Guide: `docs/AI_TRAINING_GUIDE.md`  
📊 Training Summary: `AI_TRAINING_SUMMARY.md`  
🔧 Training Script: `scripts/train-diet-ai.js`  
💾 Training Data: `lib/training-data/diet-plans.json`

---

**That's it! Your AI is now personalized to your diet plan. 🎉**
