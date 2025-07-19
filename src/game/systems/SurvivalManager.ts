import { SurvivalStats, ResourceType } from '@/types/game'

export class SurvivalManager {
  // Stat drain rates (per minute)
  private static readonly HUNGER_DRAIN_RATE = 1 / 3 // 1 per 3 minutes
  private static readonly THIRST_DRAIN_RATE = 1 / 2 // 1 per 2 minutes
  private static readonly BLEED_DAMAGE_RATE = 2 / 6 // 2 HP per 10 seconds = 12 HP per minute

  // Penalties
  private static readonly THIRST_SPRINT_PENALTY = 0.3 // -30% sprint when thirsty
  private static readonly MAX_BLEED_STACKS = 5

  /**
   * Update survival stats based on time elapsed
   */
  static updateStats(
    stats: SurvivalStats, 
    deltaTimeMs: number,
    isOnline: boolean = true
  ): SurvivalStats {
    const deltaMinutes = deltaTimeMs / (1000 * 60)
    const newStats = { ...stats }
    
    // Update timestamp
    newStats.lastStatUpdate = new Date()
    
    // Hunger drain
    newStats.hunger = Math.max(0, newStats.hunger - (this.HUNGER_DRAIN_RATE * deltaMinutes))
    
    // Thirst drain
    newStats.thirst = Math.max(0, newStats.thirst - (this.THIRST_DRAIN_RATE * deltaMinutes))
    
    // Bleed damage (only when online)
    if (isOnline && newStats.bleed > 0) {
      const bleedDamage = newStats.bleed * this.BLEED_DAMAGE_RATE * deltaMinutes
      newStats.health = Math.max(0, newStats.health - bleedDamage)
    }
    
    // Health regeneration (only if not hungry and not bleeding)
    if (newStats.hunger > 10 && newStats.bleed === 0 && newStats.health < newStats.maxHealth) {
      const regenRate = 2 // 2 HP per minute when well-fed
      newStats.health = Math.min(newStats.maxHealth, newStats.health + (regenRate * deltaMinutes))
    }
    
    // Can't die from hunger when offline (as per spec)
    if (!isOnline && newStats.health <= 1 && newStats.hunger === 0) {
      newStats.health = 1
    }
    
    return newStats
  }

  /**
   * Apply damage and potentially add bleed
   */
  static applyDamage(
    stats: SurvivalStats, 
    damage: number, 
    causesBleed: boolean = false
  ): SurvivalStats {
    const newStats = { ...stats }
    
    // Apply damage
    newStats.health = Math.max(0, newStats.health - damage)
    
    // Add bleed stack if caused by weapon
    if (causesBleed && newStats.bleed < this.MAX_BLEED_STACKS) {
      newStats.bleed = Math.min(this.MAX_BLEED_STACKS, newStats.bleed + 1)
    }
    
    return newStats
  }

  /**
   * Consume food/drink items
   */
  static consumeItem(stats: SurvivalStats, itemType: ResourceType): SurvivalStats {
    const newStats = { ...stats }
    
    switch (itemType) {
      case ResourceType.COOKED_FISH:
        newStats.hunger = Math.min(newStats.maxHunger, newStats.hunger + 30)
        newStats.health = Math.min(newStats.maxHealth, newStats.health + 10)
        break
        
      case ResourceType.FISH:
        newStats.hunger = Math.min(newStats.maxHunger, newStats.hunger + 15)
        break
        
      case ResourceType.BERRIES:
        newStats.hunger = Math.min(newStats.maxHunger, newStats.hunger + 10)
        break
        
      case ResourceType.COCONUT:
        newStats.thirst = Math.min(newStats.maxThirst, newStats.thirst + 25)
        break
        
      case ResourceType.BANDAGE:
        newStats.bleed = Math.max(0, newStats.bleed - 1)
        break
        
      case ResourceType.FIRST_AID_KIT:
        newStats.health = Math.min(newStats.maxHealth, newStats.health + 50)
        newStats.bleed = 0
        break
    }
    
    return newStats
  }

  /**
   * Check if player can sprint (not affected by thirst)
   */
  static canSprint(stats: SurvivalStats): boolean {
    return stats.thirst > 10
  }

  /**
   * Get sprint speed multiplier
   */
  static getSprintMultiplier(stats: SurvivalStats): number {
    if (stats.thirst <= 10) {
      return 1 - this.THIRST_SPRINT_PENALTY
    }
    return 1.0
  }

  /**
   * Check if player can regenerate health
   */
  static canRegenerateHealth(stats: SurvivalStats): boolean {
    return stats.hunger > 10 && stats.bleed === 0
  }

  /**
   * Create default survival stats
   */
  static createDefaultStats(): SurvivalStats {
    return {
      health: 100,
      maxHealth: 100,
      hunger: 100,
      maxHunger: 100,
      thirst: 100,
      maxThirst: 100,
      bleed: 0,
      lastStatUpdate: new Date()
    }
  }

  /**
   * Get warning messages for low stats
   */
  static getWarnings(stats: SurvivalStats): string[] {
    const warnings: string[] = []
    
    if (stats.health <= 20) {
      warnings.push('Critical health!')
    }
    
    if (stats.hunger <= 10) {
      warnings.push('Starving - no health regeneration')
    }
    
    if (stats.thirst <= 10) {
      warnings.push('Dehydrated - reduced sprint speed')
    }
    
    if (stats.bleed > 0) {
      warnings.push(`Bleeding (${stats.bleed} stacks) - losing health!`)
    }
    
    return warnings
  }

  /**
   * Check if player should respawn (health <= 0)
   */
  static shouldRespawn(stats: SurvivalStats): boolean {
    return stats.health <= 0
  }

  /**
   * Handle respawn - reset stats with penalties
   */
  static respawn(stats: SurvivalStats): SurvivalStats {
    return {
      ...stats,
      health: stats.maxHealth * 0.5, // Respawn with 50% health
      hunger: Math.max(20, stats.hunger), // Don't lose all hunger
      thirst: Math.max(20, stats.thirst), // Don't lose all thirst
      bleed: 0, // Clear bleed on respawn
      lastStatUpdate: new Date()
    }
  }
} 