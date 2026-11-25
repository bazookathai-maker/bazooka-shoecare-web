import { Link } from 'react-router-dom';
import { useLocale } from '../i18n/LocaleContext';

export default function LocaleLink({ to, ...props }) {
  const { localize } = useLocale();
  return <Link to={typeof to === 'string' ? localize(to) : to} {...props} />;
}
