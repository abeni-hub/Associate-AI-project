import React from 'react';
import { Brand } from '../../shared';
import { Icon } from '../../shared';
import type { LoginStoryProps } from '../types/auth.types';
import styles from '../styles/loginStory.module.css';

export const LoginStory: React.FC<LoginStoryProps> = ({ className = '' }) => {
  return (
    <section className={`${styles.story} ${className}`.trim()}>
      <div className={styles.storyInner}>
        <Brand />

        <div className={styles.storyCopy}>
          <div className={styles.eyebrow}>
            <span className={styles.eyebrowLine} />
            A CLEARER WAY TO SERVE
          </div>
          <h1 className={styles.headline}>
            Every visit.
            <br />
            <em>Better informed.</em>
          </h1>
          <p className={styles.description}>
            One shared workspace for the people who keep public service information clear,
            useful, and up to date.
          </p>
        </div>

        <div className={styles.journeyCard}>
          <div className={styles.cardHeading}>
            <span className={styles.cardIcon}>
              <Icon name="route" size={19} />
            </span>
            <span>THE CITIZEN JOURNEY</span>
            <span className={styles.liveDot} />
          </div>

          <div className={styles.journeyTrack}>
            <div className={styles.journeyStep}>
              <span className={styles.journeyNode}>
                <Icon name="check" size={13} />
              </span>
              <span>
                <b>Before the visit</b>
                <small>Requirements & room guide</small>
              </span>
            </div>

            <span className={styles.journeyLine} />

            <div className={styles.journeyStep}>
              <span className={styles.journeyNode}>
                <Icon name="building" size={13} />
              </span>
              <span>
                <b>At the bureau</b>
                <small>Clear, step-by-step service</small>
              </span>
            </div>

            <span className={styles.journeyLine} />

            <div className={styles.journeyStep}>
              <span className={`${styles.journeyNode} ${styles.goldNode}`}>
                <Icon name="message" size={13} />
              </span>
              <span>
                <b>After the visit</b>
                <small>Feedback reaches the right team</small>
              </span>
            </div>
          </div>

          <div className={styles.cardFooter}>
            <span>One connected service experience</span>
            <span>01 — 03</span>
          </div>
        </div>

        <div className={styles.storyFooter}>
          <span>
            <Icon name="shield" size={15} /> Role-based access for public service teams
          </span>
          <span>ADDIS ABABA · ETHIOPIA</span>
        </div>
      </div>
    </section>
  );
};

export default LoginStory;

