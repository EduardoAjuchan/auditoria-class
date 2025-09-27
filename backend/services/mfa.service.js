const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const MFAModel = require('../models/mfa.model');

/**
 * Servicio para gestión de autenticación multi-factor (MFA/TOTP)
 */
class MFAService {
  /**
   * Generar secreto TOTP para usuario
   */
  static async generateMFASecret(userId, username) {
    try {
      // Generar secreto
      const secret = speakeasy.generateSecret({
        name: `Auditoria App (${username})`,
        issuer: 'Auditoria System',
        length: 32
      });

      // Guardar en base de datos
      await MFAModel.createMFASecret(userId, secret.base32);

      // Generar QR code
      const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

      return {
        secret: secret.base32,
        qr_code: qrCodeUrl,
        manual_entry_key: secret.base32
      };

    } catch (error) {
      console.error('Error generando secreto MFA:', error);
      throw new Error('Error generando configuración MFA');
    }
  }

  /**
   * Verificar código TOTP
   */
  static async verifyTOTP(userId, token) {
    try {
      const mfaData = await MFAModel.getMFAByUserId(userId);
      
      if (!mfaData) {
        return { valid: false, error: 'MFA no configurado para este usuario' };
      }

      const verified = speakeasy.totp.verify({
        secret: mfaData.secret,
        encoding: 'base32',
        token: token.toString(),
        window: 2 // Permitir 2 ventanas de tiempo (60 segundos antes/después)
      });

      return { 
        valid: verified, 
        error: verified ? null : 'Código TOTP inválido o expirado' 
      };

    } catch (error) {
      console.error('Error verificando TOTP:', error);
      return { valid: false, error: 'Error interno verificando código' };
    }
  }

  /**
   * Habilitar MFA para usuario
   */
  static async enableMFA(userId, verificationToken) {
    try {
      // Verificar que el token sea válido antes de habilitar
      const verification = await this.verifyTOTP(userId, verificationToken);
      
      if (!verification.valid) {
        return { success: false, error: verification.error };
      }

      // Habilitar MFA
      const enabled = await MFAModel.enableMFA(userId);
      
      return { 
        success: enabled, 
        error: enabled ? null : 'Error habilitando MFA' 
      };

    } catch (error) {
      console.error('Error habilitando MFA:', error);
      return { success: false, error: 'Error interno habilitando MFA' };
    }
  }

  /**
   * Deshabilitar MFA para usuario
   */
  static async disableMFA(userId) {
    try {
      const disabled = await MFAModel.disableMFA(userId);
      return { 
        success: disabled, 
        error: disabled ? null : 'Error deshabilitando MFA' 
      };
    } catch (error) {
      console.error('Error deshabilitando MFA:', error);
      return { success: false, error: 'Error interno deshabilitando MFA' };
    }
  }

  /**
   * Verificar si usuario tiene MFA habilitado
   */
  static async isMFAEnabled(userId) {
    try {
      return await MFAModel.isMFAEnabled(userId);
    } catch (error) {
      console.error('Error verificando estado MFA:', error);
      return false;
    }
  }

  /**
   * Obtener estado MFA del usuario
   */
  static async getMFAStatus(userId) {
    try {
      const mfaData = await MFAModel.getMFAByUserId(userId);
      
      return {
        configured: !!mfaData,
        enabled: mfaData ? mfaData.is_enabled : false,
        created_at: mfaData ? mfaData.created_at : null
      };
    } catch (error) {
      console.error('Error obteniendo estado MFA:', error);
      return { configured: false, enabled: false, created_at: null };
    }
  }
}

module.exports = MFAService;