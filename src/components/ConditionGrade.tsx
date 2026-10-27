import { gradeLabel, gradePercent, gradeTone, toneColorVar } from '../lib/condition'
import styles from './ConditionGrade.module.css'

/**
 * Condition indicator. Always labeled "Condition" so the grade is never mistaken
 * for a price/deal score, shown as a tone-colored meter with the value out of 5
 * and a plain-language word (Excellent → Poor).
 */
export default function ConditionGrade({
  grade,
  variant = 'compact',
}: {
  grade: number
  variant?: 'compact' | 'full'
}) {
  const tone = gradeTone(grade)
  const color = toneColorVar(tone)
  const label = gradeLabel(grade)
  const pct = gradePercent(grade)

  return (
    <div className={variant === 'full' ? styles.full : styles.compact}>
      <div className={styles.top}>
        <span className={styles.caption}>
          Condition{variant === 'full' ? ' grade' : ''}
        </span>
        <span className={styles.score}>
          <span className={`${styles.num} tnum`}>{grade.toFixed(1)}</span>
          <span className={styles.max}>/5</span>
          <span className={styles.sep}>·</span>
          <span className={styles.word} style={{ color }}>
            {label}
          </span>
        </span>
      </div>
      <div className={styles.bar}>
        <div className={styles.fill} style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  )
}
