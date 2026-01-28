import { useRef } from "react";
import { Edit2, Trash2 } from "lucide-react";

const AvatarUpload = ({
  avatarUrl,
  defaultAvatar,
  onUpload,
  onDelete,
  uploading = false,
  deleting = false,
  showDelete = true,
  size = "lg", // "sm", "md", "lg"
  shape = "circle", // "circle" or "square"
  alt = "Avatar"
}) => {
  const fileInputRef = useRef(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(file);
    }
  };

  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-24 h-24",
    lg: "w-32 h-32"
  };

  const shapeClasses = {
    circle: "rounded-full",
    square: "rounded-xl"
  };

  return (
    <div className="shrink-0 relative inline-block">
      <img
        src={avatarUrl || defaultAvatar}
        alt={alt}
        className={`${sizeClasses[size]} ${shapeClasses[shape]} object-cover shadow-md border-4 border-card-background dark:border-card-background-dark`}
      />
      
      {/* Delete Button - Upper Right */}
      {showDelete && avatarUrl && (
        <button
          type="button"
          onClick={onDelete}
          disabled={uploading || deleting}
          className="absolute top-0 right-0 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed transform translate-x-1 -translate-y-1"
          title="Delete avatar"
        >
          {deleting ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Trash2 size={18} />
          )}
        </button>
      )}

      {/* Upload Button - Lower Right */}
      <button
        type="button"
        onClick={handleClick}
        disabled={uploading || deleting}
        className="absolute bottom-0 right-0 bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full shadow-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed transform translate-x-1 translate-y-1"
        title="Update avatar"
      >
        {uploading ? (
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <Edit2 size={18} />
        )}
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};

export default AvatarUpload;
