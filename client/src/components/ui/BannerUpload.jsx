import { useRef } from "react";
import { Edit2, Trash2 } from "lucide-react";

const BannerUpload = ({
  bannerUrl,
  defaultBanner,
  onUpload,
  onDelete,
  uploading = false,
  deleting = false,
  showDelete = true,
  height = "h-40", // Tailwind height class
  alt = "Banner"
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

  return (
    <div className="relative w-full">
      <div className={`w-full ${height} rounded-xl overflow-hidden bg-linear-to-br from-primary to-primary-dark dark:from-primary-dark dark:to-secondary-dark relative group`}>
        {bannerUrl || defaultBanner ? (
          <img 
            src={bannerUrl || defaultBanner} 
            alt={alt} 
            className="w-full h-full object-cover" 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center border-2 border-dashed border-base-dark dark:border-base">
            <div className="flex flex-col items-center gap-2 text-base dark:text-base-dark">
              <Edit2 size={24} />
              <span className="text-sm font-medium">Upload Banner</span>
            </div>
          </div>
        )}

        {/* Delete Button - Upper Right */}
        {showDelete && bannerUrl && (
          <button
            type="button"
            onClick={onDelete}
            disabled={uploading || deleting}
            className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed z-10"
            title="Delete banner"
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
          className="absolute bottom-3 right-3 bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full shadow-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed z-10"
          title="Update banner"
        >
          {uploading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Edit2 size={18} />
          )}
        </button>
      </div>

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

export default BannerUpload;
