const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const User = require('./models/User');
const Transaction = require('./models/Transaction');

// --- Helpers ---

/**
 * Random integer between min and max (inclusive)
 */
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Random float between min and max, rounded to 2 decimals
 */
function randAmount(min, max) {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

/**
 * Generate a date at a given day offset from today
 */
function daysAgo(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(randInt(8, 20), randInt(0, 59), 0, 0);
  return d;
}

// --- Main seed function ---

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected for seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Transaction.deleteMany({});
    console.log('Cleared existing users and transactions.');

    // Create demo user
    const user = await User.create({
      name: 'Demo User',
      email: 'demo@finguard.com',
      passwordHash: 'password123',
      monthlyIncome: 85000,
    });
    console.log(`Created demo user: ${user.email}`);

    const transactions = [];
    const userId = user._id;

    // Generate 2 years (730 days) of transactions
    for (let day = 0; day < 730; day++) {
      const date = daysAgo(day);
      const dayOfMonth = date.getDate();
      const dayOfWeek = date.getDay(); // 0=Sun, 6=Sat

      // --- Monthly transactions (1st of month) ---
      if (dayOfMonth === 1) {
        // Monthly income
        transactions.push({
          userId,
          amount: 85000,
          category: 'income',
          type: 'income',
          description: 'Monthly salary',
          date,
        });

        // Rent
        transactions.push({
          userId,
          amount: 12000,
          category: 'rent',
          type: 'expense',
          description: 'Monthly rent payment',
          date,
        });

        // Utilities
        transactions.push({
          userId,
          amount: randAmount(1000, 2500),
          category: 'utilities',
          type: 'expense',
          description: 'Monthly utilities bill',
          date,
        });

        // Healthcare
        transactions.push({
          userId,
          amount: randAmount(500, 2000),
          category: 'healthcare',
          type: 'expense',
          description: 'Health insurance / medical',
          date,
        });

        // Debt payment
        transactions.push({
          userId,
          amount: 3000,
          category: 'debt_payment',
          type: 'debt',
          description: 'Monthly loan payment',
          date,
        });

        // Savings
        transactions.push({
          userId,
          amount: randAmount(8000, 15000),
          category: 'savings',
          type: 'savings',
          description: 'Monthly savings transfer',
          date,
        });
      }

      // --- Weekly-ish transactions ---

      // Groceries: 3-4 times per week (Mon, Wed, Fri, sometimes Sat)
      if ([1, 3, 5].includes(dayOfWeek) || (dayOfWeek === 6 && Math.random() > 0.5)) {
        transactions.push({
          userId,
          amount: randAmount(500, 1500),
          category: 'groceries',
          type: 'expense',
          description: 'Grocery shopping',
          date,
        });
      }

      // Transport: 3-5 times per week (weekdays)
      if (dayOfWeek >= 1 && dayOfWeek <= 5 && Math.random() > 0.2) {
        transactions.push({
          userId,
          amount: randAmount(100, 500),
          category: 'transport',
          type: 'expense',
          description: 'Transportation / fuel',
          date,
        });
      }

      // Entertainment: 2-3 times per week
      if (Math.random() > 0.8) {
        transactions.push({
          userId,
          amount: randAmount(200, 1000),
          category: 'entertainment',
          type: 'expense',
          description: 'Entertainment / streaming / events',
          date,
        });
      }

      // Dining: 3-5 times per week
      if (Math.random() > 0.7) {
        transactions.push({
          userId,
          amount: randAmount(150, 600),
          category: 'dining',
          type: 'expense',
          description: 'Restaurant / takeout',
          date,
        });
      }

      // Shopping: 1-2 times per week
      if (Math.random() > 0.9) {
        transactions.push({
          userId,
          amount: randAmount(300, 2000),
          category: 'shopping',
          type: 'expense',
          description: 'Online / retail shopping',
          date,
        });
      }
    }

    // Bulk insert all transactions
    const inserted = await Transaction.insertMany(transactions);

    // --- Print summary ---
    console.log('\n--- Seed Summary ---');
    console.log(`Total transactions created: ${inserted.length}`);

    const categoryCounts = {};
    let totalIncome = 0;
    let totalExpenses = 0;
    let totalSavings = 0;
    let totalDebt = 0;

    inserted.forEach((t) => {
      categoryCounts[t.category] = (categoryCounts[t.category] || 0) + 1;
      switch (t.type) {
        case 'income':
          totalIncome += t.amount;
          break;
        case 'expense':
          totalExpenses += t.amount;
          break;
        case 'savings':
          totalSavings += t.amount;
          break;
        case 'debt':
          totalDebt += t.amount;
          break;
      }
    });

    console.log('\nBy category:');
    Object.entries(categoryCounts)
      .sort((a, b) => b[1] - a[1])
      .forEach(([cat, count]) => {
        console.log(`  ${cat}: ${count} transactions`);
      });

    console.log(`\nTotal income:   ₹${totalIncome.toFixed(2)}`);
    console.log(`Total expenses: ₹${totalExpenses.toFixed(2)}`);
    console.log(`Total savings:  ₹${totalSavings.toFixed(2)}`);
    console.log(`Total debt:     ₹${totalDebt.toFixed(2)}`);

    console.log('\nSeeding complete!');
  } catch (error) {
    console.error('Seeding error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB disconnected.');
  }
}

seed();
