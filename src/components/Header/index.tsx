import Link from 'next/link';
import styles from './header.module.scss';

export default function Header() {
  // TODO
  return (

    <div className={styles.container}>
      <Link href={"/"}>
        <img src="/images/logo.svg" alt="logo" />
      </Link>

    </div>

  )
}
