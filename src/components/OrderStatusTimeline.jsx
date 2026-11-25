import { ORDER_STATUS_STEPS, getStatusStepIndex } from '../utils/orderStorage';
import { useLocale } from '../i18n/LocaleContext';
import './OrderStatusTimeline.css';

export default function OrderStatusTimeline({ status }) {
  const { t } = useLocale();
  const currentIndex = getStatusStepIndex(status);

  return (
    <ol className="order-timeline" aria-label={t.orders.timeline}>
      {ORDER_STATUS_STEPS.map((step, index) => {
        const isDone = index < currentIndex;
        const isCurrent = index === currentIndex;

        return (
          <li
            key={step.id}
            className={[
              'order-timeline__step',
              isDone ? 'order-timeline__step--done' : '',
              isCurrent ? 'order-timeline__step--current' : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <span className="order-timeline__marker" aria-hidden="true" />
            <div className="order-timeline__content">
              <span className="order-timeline__label">{t.orders.steps[step.id] || step.label}</span>
              {isCurrent ? (
                <span className="order-timeline__badge">{t.orders.current}</span>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
