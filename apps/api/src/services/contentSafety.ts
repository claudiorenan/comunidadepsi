/**
 * Content Safety Service
 * Detects sensitive data in user-generated content
 * LGPD Compliance: Prevents sharing of personal data
 */
import { logger } from '../utils/logger.js'
import { RiskLevel, ScanResult, DetectionFlag } from 'shared/types'

interface PatternConfig {
  pattern: RegExp
  type: string
  message: string
  points: number
}

const PATTERNS: PatternConfig[] = [
  // CPF: XXX.XXX.XXX-XX
  {
    pattern: /\d{3}\.\d{3}\.\d{3}-\d{2}/g,
    type: 'cpf',
    message: 'Número de CPF detectado',
    points: 30
  },
  // CPF without formatting: XXXXXXXXXXX
  {
    pattern: /\b\d{11}\b/g,
    type: 'cpf',
    message: 'Possível CPF detectado',
    points: 20
  },
  // RG: XX.XXX.XXX-X
  {
    pattern: /\d{2}\.\d{3}\.\d{3}-\d{1}/g,
    type: 'rg',
    message: 'Número de RG detectado',
    points: 25
  },
  // Phone: (XX) XXXXX-XXXX or (XX) XXXX-XXXX
  {
    pattern: /\(\d{2}\)\s?\d{4,5}-\d{4}/g,
    type: 'phone',
    message: 'Número de telefone detectado',
    points: 20
  },
  // Phone: XX XXXXX-XXXX
  {
    pattern: /\d{2}\s\d{4,5}-\d{4}/g,
    type: 'phone',
    message: 'Possível número de telefone',
    points: 15
  },
  // Email
  {
    pattern: /\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/g,
    type: 'email',
    message: 'Endereço de email detectado',
    points: 15
  },
  // Date of birth: DD/MM/YYYY
  {
    pattern: /\b(0[1-9]|[12]\d|3[01])\/(0[1-9]|1[012])\/(19|20)\d{2}\b/g,
    type: 'dob',
    message: 'Possível data de nascimento detectada',
    points: 20
  },
  // PII: Nome + Last name pattern (may be too aggressive)
  {
    pattern: /(?:Dr\.?|Dra\.?)\s+[A-ZÁÉÍÓÚ][a-záéíóú]+\s+[A-ZÁÉÍÓÚ][a-záéíóú]+/g,
    type: 'pii',
    message: 'Informação pessoal identificável detectada',
    points: 10
  }
]

export class ContentSafetyScanner {
  /**
   * Scan content for sensitive data
   */
  scanContent(content: string): ScanResult {
    const flags: DetectionFlag[] = []
    let totalScore = 0

    // Normalize content
    const normalizedContent = content.toLowerCase()

    // Check each pattern
    for (const config of PATTERNS) {
      const matches = Array.from(normalizedContent.matchAll(config.pattern))

      if (matches.length > 0) {
        totalScore += config.points * matches.length

        flags.push({
          type: config.type,
          pattern: config.pattern.source,
          message: config.message,
          count: matches.length
        })
      }
    }

    // Determine risk level
    const riskLevel = this.getRiskLevel(totalScore)

    // Generate suggestions
    const suggestions = this.generateSuggestions(flags)

    logger.info(`Content safety scan: score=${totalScore}, level=${riskLevel}`)

    return {
      riskLevel,
      score: totalScore,
      flags,
      suggestions
    }
  }

  /**
   * Determine risk level based on score
   */
  private getRiskLevel(score: number): RiskLevel {
    const highThreshold = parseInt(process.env.CONTENT_SAFETY_RISK_THRESHOLD_HIGH || '80')
    const mediumThreshold = parseInt(process.env.CONTENT_SAFETY_RISK_THRESHOLD_MEDIUM || '50')

    if (score >= highThreshold) return RiskLevel.HIGH
    if (score >= mediumThreshold) return RiskLevel.MEDIUM
    return RiskLevel.LOW
  }

  /**
   * Generate safety suggestions
   */
  private generateSuggestions(flags: DetectionFlag[]): string[] {
    const suggestions: string[] = []

    if (flags.some(f => f.type === 'cpf')) {
      suggestions.push('❌ Não compartilhe números de CPF')
    }

    if (flags.some(f => f.type === 'rg')) {
      suggestions.push('❌ Não compartilhe números de RG')
    }

    if (flags.some(f => f.type === 'phone')) {
      suggestions.push('❌ Não compartilhe números de telefone')
    }

    if (flags.some(f => f.type === 'email')) {
      suggestions.push('❌ Não compartilhe endereços de email pessoais')
    }

    if (flags.some(f => f.type === 'dob')) {
      suggestions.push('❌ Não compartilhe datas de nascimento')
    }

    if (flags.some(f => f.type === 'pii')) {
      suggestions.push('⚠️ Possível informação pessoal identificável detectada')
    }

    if (suggestions.length === 0) {
      suggestions.push('✅ Seu conteúdo parece seguro em relação a dados pessoais')
    }

    return suggestions
  }
}

export function getContentSafetyScanner(): ContentSafetyScanner {
  return new ContentSafetyScanner()
}
