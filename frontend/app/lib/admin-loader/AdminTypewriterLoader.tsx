import styles from "./AdminTypewriterLoader.module.css";

type AdminTypewriterLoaderProps = {
  label?: string;
};

export default function AdminTypewriterLoader({
  label = "Loading admin workspace...",
}: AdminTypewriterLoaderProps) {
  return (
    <div className={styles.loaderShell} role="status" aria-live="polite" aria-label={label}>
      <div className={styles.loaderContent}>
        <div className={styles.typewriter} aria-hidden="true">
          <div className={styles.slide}>
            <i />
          </div>
          <div className={styles.paper} />
          <div className={styles.keyboard} />
        </div>
        <p className={styles.loaderLabel}>{label}</p>
      </div>
    </div>
  );
}
