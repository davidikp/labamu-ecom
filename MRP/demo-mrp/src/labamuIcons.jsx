import React from 'react';

import analyticsSrc from '../icons/Analytics.svg';
import billsSrc from '../icons/Bills.svg';
import bomSrc from '../icons/Bahan Baku - Alt4.svg';
import calendarSrc from '../icons/calendar.svg';
import chartSrc from '../icons/Chart.svg';
import checkSrc from '../icons/Check.svg';
import chevronDownSrc from '../icons/Chevron down.svg';
import chevronLeftSrc from '../icons/Chevron left.svg';
import chevronRightSrc from '../icons/Chevron right.svg';
import closeSrc from '../icons/Close.svg';
import deleteSrc from '../icons/Delete.svg';
import directionsSrc from '../icons/directions.svg';
import documentSrc from '../icons/document.svg';
import downloadSrc from '../icons/cloud download.svg';
import editSrc from '../icons/Edit.svg';
import fileSrc from '../icons/File Icon.svg';
import filterSrc from '../icons/Filter.svg';
import gridSrc from '../icons/Grid.svg';
import imageSrc from '../icons/Image.svg';
import infoSrc from '../icons/Info.svg';
import languageSrc from '../icons/language.svg';
import listSrc from '../icons/Menu alternative.svg';
import logoSrc from '../icons/Labamu-Icon.svg';
import minusSrc from '../icons/Reduce.svg';
import moreVerticalSrc from '../icons/More vertical.svg';
import notificationsSrc from '../icons/notifications.svg';
import plusSrc from '../icons/Add.svg';
import productSrc from '../icons/Product.svg';
import resourcesSrc from '../icons/supervisor.svg';
import salesSrc from '../icons/transaction.svg';
import searchSrc from '../icons/Search.svg';
import taskListSrc from '../icons/task list.svg';
import toolSrc from '../icons/tool.svg';
import uploadSrc from '../icons/Upload.svg';

const resolveSize = (size) => (typeof size === 'number' ? `${size}px` : size);

const BaseLabamuIcon = ({
  src,
  size = 24,
  color = 'currentColor',
  mode = 'mask',
  style = {},
  title,
  alt = '',
  strokeWidth,
  ...props
}) => {
  const dimension = resolveSize(size);

  if (mode === 'image') {
    return (
      <img
        src={src}
        alt={alt}
        title={title}
        style={{
          width: dimension,
          height: dimension,
          display: 'block',
          objectFit: 'contain',
          ...style
        }}
        {...props}
      />
    );
  }

  return (
    <span
      role={title ? 'img' : undefined}
      aria-label={title || undefined}
      title={title}
      style={{
        display: 'inline-block',
        width: dimension,
        height: dimension,
        flexShrink: 0,
        backgroundColor: color,
        WebkitMaskImage: `url("${src}")`,
        maskImage: `url("${src}")`,
        WebkitMaskRepeat: 'no-repeat',
        maskRepeat: 'no-repeat',
        WebkitMaskPosition: 'center',
        maskPosition: 'center',
        WebkitMaskSize: 'contain',
        maskSize: 'contain',
        ...style
      }}
      {...props}
    />
  );
};

const createMaskIcon = (src) => {
  const IconComponent = ({ color = 'currentColor', ...props }) => (
    <BaseLabamuIcon src={src} color={color} mode="mask" {...props} />
  );
  return IconComponent;
};

const createImageIcon = (src) => {
  const IconComponent = (props) => <BaseLabamuIcon src={src} mode="image" {...props} />;
  return IconComponent;
};

export const BrandLogoIcon = createImageIcon(logoSrc);
export const DashboardIcon = createMaskIcon(gridSrc);
export const ProductIcon = createMaskIcon(productSrc);
export const SalesIcon = createMaskIcon(salesSrc);
export const ResourcesIcon = createMaskIcon(resourcesSrc);
export const ManufacturingIcon = createMaskIcon(toolSrc);
export const AnalyticsIcon = createMaskIcon(analyticsSrc);
export const FinancingIcon = createMaskIcon(billsSrc);
export const WorkOrderIcon = createMaskIcon(taskListSrc);
export const BillOfMaterialsIcon = createMaskIcon(bomSrc);
export const RoutingIcon = createMaskIcon(directionsSrc);
export const SearchIcon = createMaskIcon(searchSrc);
export const MoreVerticalIcon = createMaskIcon(moreVerticalSrc);
export const NotificationIcon = createMaskIcon(notificationsSrc);
export const LanguageIcon = createMaskIcon(languageSrc);
export const ChevronDownIcon = createMaskIcon(chevronDownSrc);
export const ChevronLeftIcon = createMaskIcon(chevronLeftSrc);
export const ChevronRightIcon = createMaskIcon(chevronRightSrc);
export const AddIcon = createMaskIcon(plusSrc);
export const MinusIcon = createMaskIcon(minusSrc);
export const EditIcon = createMaskIcon(editSrc);
export const DeleteIcon = createMaskIcon(deleteSrc);
export const UploadIcon = createMaskIcon(uploadSrc);
export const DownloadIcon = createMaskIcon(downloadSrc);
export const DocumentIcon = createMaskIcon(documentSrc);
export const FileIcon = createMaskIcon(fileSrc);
export const ImageAssetIcon = createMaskIcon(imageSrc);
export const GridViewIcon = createMaskIcon(gridSrc);
export const ListViewIcon = createMaskIcon(listSrc);
export const FilterIcon = createMaskIcon(filterSrc);
export const CalendarIcon = createMaskIcon(calendarSrc);
export const CheckIcon = createMaskIcon(checkSrc);
export const CloseIcon = createMaskIcon(closeSrc);
export const InfoIcon = createMaskIcon(infoSrc);
export const ChartIcon = createMaskIcon(chartSrc);
