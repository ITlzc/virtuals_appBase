'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useState } from 'react';
import styles from '@/styles/Header.module.scss';


function Header() {

  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <header className={`${styles.header}`}>
      <div className={styles.logo}>
        <a href="/"><img rel='preload' src="/images/logo.png" style={{height: "40px"}} alt="" /></a>
      </div>
      <nav className={`${styles.nav} ${menuOpen ? styles.open : ""}`}>
        {/* <a href="#">Enter App</a>
        <a href="#">Start to Dev</a>
        <a href="#">Docs</a> */}
        <ConnectButton />
      </nav>
      {/* 小屏菜单按钮 */}
      <button className={styles.menuButton} onClick={toggleMenu}>
        {menuOpen ? "✕" : "☰"} {/* 菜单图标 */}
      </button>
    </header>
  );
}

export default Header;
