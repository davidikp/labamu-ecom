import { useNavigate } from 'react-router-dom';
import { Breadcrumbs as CeBreadcrumbs } from '../../ce-ui';

/**
 * Standardized PageHeader component for Labamu design system.
 * Following the convention: Back Button + Title, with Breadcrumbs underneath.
 * Delegates to ce-ui's Breadcrumbs, keeping this component's own
 * { label, path } breadcrumb shape so call sites don't need to change.
 *
 * @param {string} title - The main heading of the page.
 * @param {Array} breadcrumbs - List of breadcrumb items [{ label, path }]. The last item is treated as the current page.
 * @param {string} backPath - Destination for the back button.
 * @param {function} onBack - Optional custom back handler.
 */
const PageHeader = ({ title, breadcrumbs = [], backPath, onBack, style = {} }) => {
  const navigate = useNavigate();

  const ancestors = breadcrumbs.slice(0, -1);
  const currentLabel = breadcrumbs[breadcrumbs.length - 1]?.label;

  return (
    <div style={style}>
      <CeBreadcrumbs
        title={title}
        titleOnBreadcrumb={currentLabel}
        breadcrumbs={ancestors.map((crumb) => ({ name: crumb.label, customLink: crumb.path }))}
        showBackButton={Boolean(onBack || backPath)}
        onBack={onBack || (backPath ? () => navigate(backPath) : undefined)}
        onNavigate={navigate}
      />
    </div>
  );
};

export default PageHeader;
