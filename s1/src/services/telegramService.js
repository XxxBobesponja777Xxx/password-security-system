const axios = require('axios');

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_API_BASE = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

/**
 * Enviar notificación de expiración de contraseña
 */
async function sendPasswordExpiryNotification(user, daysRemaining) {
  if (!TELEGRAM_BOT_TOKEN) {
    console.warn('⚠️  TELEGRAM_BOT_TOKEN no configurado. Notificación no enviada.');
    return false;
  }

  if (!user.telegramChatId) {
    console.warn(`⚠️  Usuario ${user.email} no tiene telegramChatId configurado.`);
    return false;
  }

  try {
    const message = `
🔐 *Alerta de Seguridad*

Hola ${user.email},

Tu contraseña expirará en *${daysRemaining} día(s)*.

Por favor, cámbiala lo antes posible para mantener tu cuenta segura.

Accede al portal: https://localhost:3001/user/

_Sistema de Gestión de Políticas de Contraseñas_
    `.trim();

    const response = await axios.post(`${TELEGRAM_API_BASE}/sendMessage`, {
      chat_id: user.telegramChatId,
      text: message,
      parse_mode: 'Markdown'
    });

    if (response.data.ok) {
      console.log(`✅ Notificación enviada a ${user.email} (${user.telegramChatId})`);
      return true;
    } else {
      console.error('❌ Error en respuesta de Telegram:', response.data);
      return false;
    }

  } catch (error) {
    console.error('❌ Error enviando notificación por Telegram:', error.message);
    return false;
  }
}

/**
 * Enviar notificación genérica
 */
async function sendTelegramMessage(chatId, message) {
  if (!TELEGRAM_BOT_TOKEN) {
    console.warn('⚠️  TELEGRAM_BOT_TOKEN no configurado.');
    return false;
  }

  try {
    const response = await axios.post(`${TELEGRAM_API_BASE}/sendMessage`, {
      chat_id: chatId,
      text: message,
      parse_mode: 'Markdown'
    });

    return response.data.ok;
  } catch (error) {
    console.error('❌ Error enviando mensaje por Telegram:', error.message);
    return false;
  }
}

module.exports = {
  sendPasswordExpiryNotification,
  sendTelegramMessage
};
