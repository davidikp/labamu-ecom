import React, { useMemo } from "react";
import { ImageField } from "../../ce-ui";

export const ImageUpload = ({ value, onChange, disabled }) => {
  const images = useMemo(() => (value ? [value] : []), [value]);

  const handleAdd = (file) => {
    const reader = new FileReader();
    reader.onloadend = () => onChange(reader.result);
    reader.readAsDataURL(file);
  };

  const handleRemove = () => onChange(null);

  return (
    <ImageField
      images={images}
      maxImages={1}
      onAdd={handleAdd}
      onRemove={handleRemove}
      platform="desktop"
      fieldDesktop={false}
    />
  );
};
