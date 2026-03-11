const cron = require('node-cron');
const User = require('../models/User');
const { sendAccountCreatedEmail } = require('../utils/emailService');

/**
 * Runs every minute — checks for verified users whose activation time has passed
 * and activates them, then sends a welcome email.
 */
const startAccountActivationJob = () => {
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();

      // Find users who are verified but not yet active, and whose scheduled activation time has passed
      const usersToActivate = await User.find({
        isVerified: true,
        isActive: false,
        activationScheduledAt: { $lte: now },
      });

      for (const user of usersToActivate) {
        user.isActive = true;
        await user.save();
        
        try {
          await sendAccountCreatedEmail(user.email);
          console.log(`Account activated and email sent: ${user.email}`);
        } catch (emailErr) {
          console.error(`Account activated but email failed for ${user.email}:`, emailErr.message);
        }
      }
    } catch (err) {
      console.error('Account activation job error:', err.message);
    }
  });

  console.log('Account activation scheduler started');
};

module.exports = { startAccountActivationJob };
