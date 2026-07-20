import React, { useState, useEffect } from 'react';
import { Search, Upload, X, Grid, Film, Image as ImageIcon, Trash2, Check, FileText } from 'lucide-react';
import { adminService } from '../../services/adminService';
import toast from 'react-hot-toast';

export default function MediaLibraryDialog({ isOpen, onClose, onSelect, activeFolder = 'media_library' }) {
  const [activeTab, setActiveTab] = useState('browse');
  const [loading, setLoading] = useState(false);
  const [mediaList, setMediaList] = useState([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1 });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [folder, setFolder] = useState(activeFolder);
  const [resourceType, setResourceType] = useState('');
  const [selectedAsset, setSelectedAsset] = useState(null);

  // Upload States
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadFolder, setUploadFolder] = useState(activeFolder);
  const [uploading, setUploading] = useState(false);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const res = await adminService.getCmsMedia(page, 15, folder === 'ALL' ? '' : folder, resourceType, search);
      setMediaList(res.items || []);
      setPagination(res.pagination || { currentPage: 1, totalPages: 1 });
    } catch (err) {
      console.error(err);
      toast.error('Failed to load media assets.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchMedia();
    }
  }, [isOpen, page, folder, resourceType]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchMedia();
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile) {
      toast.error('Please choose a file to upload first.');
      return;
    }
    setUploading(true);
    try {
      const media = await adminService.uploadMedia(uploadFile, uploadFolder);
      toast.success('File uploaded and cataloged successfully!');
      setUploadFile(null);
      setActiveTab('browse');
      fetchMedia();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteMedia = async (id, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this media asset? This cannot be undone.')) {
      try {
        await adminService.deleteMedia(id);
        toast.success('Media asset removed successfully.');
        if (selectedAsset?.id === id) {
          setSelectedAsset(null);
        }
        fetchMedia();
      } catch (err) {
        console.error(err);
        toast.error(err.message || 'Failed to delete asset.');
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-5xl h-[85vh] bg-[#FFFDFC] dark:bg-[#181818] border border-[#E6DCCF] dark:border-neutral-800 flex flex-col shadow-2xl rounded-xl overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E6DCCF] dark:border-neutral-800 flex items-center justify-between bg-primary dark:bg-neutral-900">
          <div className="space-y-0.5">
            <h3 className="font-serif text-base tracking-widest text-[#181818] dark:text-white uppercase">REUSABLE MEDIA LIBRARY</h3>
            <p className="text-[10px] font-sans text-neutral-400 uppercase tracking-wider">Select or upload optimized images & videos</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-black dark:hover:text-white rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 border-b border-[#E6DCCF] dark:border-neutral-800 flex justify-between bg-white dark:bg-[#181818] text-xs font-sans font-bold tracking-widest uppercase">
          <div className="flex gap-6">
            <button
              onClick={() => setActiveTab('browse')}
              className={`py-3.5 border-b-2 transition-colors ${
                activeTab === 'browse' ? 'border-[#B68D40] text-[#B68D40]' : 'border-transparent text-neutral-400 hover:text-neutral-600'
              }`}
            >
              Browse Library
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={`py-3.5 border-b-2 transition-colors ${
                activeTab === 'upload' ? 'border-[#B68D40] text-[#B68D40]' : 'border-transparent text-neutral-400 hover:text-neutral-600'
              }`}
            >
              Upload New
            </button>
          </div>
        </div>

        {/* Inner Content Area */}
        <div className="flex-grow flex overflow-hidden min-h-0">
          
          {/* TAB 1: BROWSE MEDIA */}
          {activeTab === 'browse' && (
            <div className="flex-grow flex overflow-hidden w-full">
              
              {/* Left Column: Grid and Filters */}
              <div className="flex-grow flex flex-col p-6 overflow-y-auto min-h-0 space-y-4">
                
                {/* Search & Filters Row */}
                <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="relative sm:col-span-2">
                    <input
                      type="text"
                      placeholder="SEARCH BY FILE NAME..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full bg-[#FFFCF8] dark:bg-neutral-850 border border-neutral-300 dark:border-neutral-700 pl-8 pr-3 py-2 text-xs font-sans tracking-wide text-black dark:text-white focus:outline-none"
                    />
                    <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-3" />
                  </div>
                  <div>
                    <select
                      value={folder}
                      onChange={(e) => { setFolder(e.target.value); setPage(1); }}
                      className="w-full bg-[#FFFCF8] dark:bg-neutral-850 border border-neutral-300 dark:border-neutral-700 px-2 py-2.5 text-xs font-sans text-neutral-600 dark:text-neutral-300 focus:outline-none"
                    >
                      <option value="ALL">ALL FOLDERS</option>
                      <option value="media_library">MEDIA LIBRARY</option>
                      <option value="products">PRODUCTS</option>
                      <option value="homepage">HOMEPAGE</option>
                      <option value="lookbooks">LOOKBOOKS</option>
                    </select>
                  </div>
                  <div>
                    <select
                      value={resourceType}
                      onChange={(e) => { setResourceType(e.target.value); setPage(1); }}
                      className="w-full bg-[#FFFCF8] dark:bg-neutral-850 border border-neutral-300 dark:border-neutral-700 px-2 py-2.5 text-xs font-sans text-neutral-600 dark:text-neutral-300 focus:outline-none"
                    >
                      <option value="">ALL FORMATS</option>
                      <option value="image">IMAGES ONLY</option>
                      <option value="video">VIDEOS ONLY</option>
                    </select>
                  </div>
                </form>

                {/* Grid */}
                {loading ? (
                  <div className="flex-grow flex flex-col items-center justify-center py-20 text-neutral-400 italic font-serif">
                    <div className="border border-t-[#B68D40] border-[#ECECEC] rounded-full w-8 h-8 animate-spin mb-3" />
                    <span>Loading assets list...</span>
                  </div>
                ) : mediaList.length === 0 ? (
                  <div className="flex-grow flex flex-col items-center justify-center py-20 text-neutral-400 italic font-serif border border-dashed border-neutral-200 rounded-lg">
                    <span>No media files found in this category.</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                    {mediaList.map((asset) => (
                      <div
                        key={asset.id}
                        onClick={() => setSelectedAsset(asset)}
                        className={`group relative aspect-square cursor-pointer overflow-hidden border transition-all duration-300 ${
                          selectedAsset?.id === asset.id
                            ? 'border-[#B68D40] ring-2 ring-[#B68D40]/30 shadow-md scale-[0.98]'
                            : 'border-neutral-200 dark:border-neutral-850 hover:border-neutral-400 bg-neutral-50 dark:bg-neutral-900'
                        }`}
                      >
                        {asset.resourceType === 'video' ? (
                          <div className="w-full h-full relative flex items-center justify-center bg-black">
                            <Film className="w-8 h-8 text-neutral-600" />
                            <div className="absolute top-1.5 left-1.5 bg-black/70 text-[7px] font-sans font-bold px-1 py-0.5 rounded text-white tracking-widest uppercase">VIDEO</div>
                          </div>
                        ) : (
                          <img src={asset.url} alt={asset.filename} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                        )}
                        {/* Selector overlays */}
                        {selectedAsset?.id === asset.id && (
                          <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-[#B68D40] text-white flex items-center justify-center shadow">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        )}
                        {/* Delete action overlay */}
                        {(!asset.usedIn || asset.usedIn.length === 0) && (
                          <button
                            onClick={(e) => handleDeleteMedia(asset.id, e)}
                            className="absolute bottom-1.5 right-1.5 p-1.5 bg-white/95 dark:bg-neutral-800 text-neutral-400 hover:text-red-600 rounded opacity-0 group-hover:opacity-100 transition-opacity shadow duration-200 focus:outline-none"
                            title="Delete permanently"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="flex justify-center items-center gap-3 pt-6 text-[10px] font-sans font-bold tracking-widest text-neutral-500 uppercase">
                    <button
                      disabled={page === 1}
                      onClick={() => setPage(page - 1)}
                      className="px-3 py-1.5 border hover:border-[#B68D40] disabled:opacity-30 disabled:hover:border-neutral-200 transition-colors"
                    >
                      Prev
                    </button>
                    <span>Page {page} of {pagination.totalPages}</span>
                    <button
                      disabled={page === pagination.totalPages}
                      onClick={() => setPage(page + 1)}
                      className="px-3 py-1.5 border hover:border-[#B68D40] disabled:opacity-30 disabled:hover:border-neutral-200 transition-colors"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>

              {/* Right Column: Asset details drawer */}
              <div className="w-72 shrink-0 border-l border-[#E6DCCF] dark:border-neutral-800 p-6 bg-primary dark:bg-neutral-900 flex flex-col justify-between overflow-y-auto text-[10px] font-sans">
                {selectedAsset ? (
                  <div className="space-y-6">
                    <h4 className="text-xs font-serif tracking-widest text-[#B68D40] uppercase border-b pb-1.5">Asset Details</h4>
                    
                    {/* Visual Preview */}
                    <div className="aspect-[4/3] border bg-white dark:bg-neutral-800 overflow-hidden flex items-center justify-center">
                      {selectedAsset.resourceType === 'video' ? (
                        <video src={selectedAsset.url} controls className="w-full h-full object-contain bg-black" />
                      ) : (
                        <img src={selectedAsset.url} alt="" className="w-full h-full object-contain" />
                      )}
                    </div>

                    {/* Metadata fields */}
                    <div className="space-y-3.5 text-neutral-600 dark:text-neutral-400">
                      <div>
                        <span className="text-[8px] text-neutral-400 uppercase tracking-widest block">FILE NAME</span>
                        <p className="font-semibold text-neutral-800 dark:text-white break-all">{selectedAsset.filename}</p>
                      </div>
                      <div>
                        <span className="text-[8px] text-neutral-400 uppercase tracking-widest block">FOLDER PATH</span>
                        <p className="font-mono bg-white dark:bg-neutral-800 px-1 py-0.5 border text-neutral-700 dark:text-neutral-300">{selectedAsset.folder}</p>
                      </div>
                      <div>
                        <span className="text-[8px] text-neutral-400 uppercase tracking-widest block">SIZE & FORMAT</span>
                        <p className="font-mono text-neutral-700 dark:text-neutral-300 uppercase">{(selectedAsset.fileSize / 1024).toFixed(1)} KB • {selectedAsset.format}</p>
                      </div>
                      <div>
                        <span className="text-[8px] text-neutral-400 uppercase tracking-widest block">UPLOADED BY</span>
                        <p className="font-semibold text-neutral-700 dark:text-neutral-300">{selectedAsset.createdBy || 'SYSTEM'}</p>
                      </div>
                      <div>
                        <span className="text-[8px] text-neutral-400 uppercase tracking-widest block">USED IN</span>
                        {selectedAsset.usedIn && selectedAsset.usedIn.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {selectedAsset.usedIn.map((loc) => (
                              <span key={loc} className="px-1.5 py-0.5 border bg-white dark:bg-neutral-850 font-mono text-[7.5px] uppercase rounded">{loc}</span>
                            ))}
                          </div>
                        ) : (
                          <p className="italic text-neutral-400">Unreferenced (Safe to delete)</p>
                        )}
                      </div>
                    </div>

                    {/* Select action */}
                    <button
                      onClick={() => onSelect(selectedAsset.url)}
                      className="w-full bg-[#181818] hover:bg-[#B68D40] text-[#D4AF37] hover:text-[#181818] border border-[#B68D40] py-3 text-[10px] font-sans font-bold tracking-widest uppercase transition-all duration-300"
                    >
                      Select Asset URL
                    </button>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-center text-neutral-400 italic">
                    <span>Select an asset to view metadata and usage logs.</span>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 2: UPLOAD FILE */}
          {activeTab === 'upload' && (
            <div className="flex-grow p-10 flex flex-col items-center justify-center max-w-2xl mx-auto space-y-6">
              
              <div className="text-center space-y-2">
                <h4 className="font-serif text-lg tracking-wider uppercase text-[#181818] dark:text-white">Upload silhoutte assets</h4>
                <p className="text-[10px] text-neutral-400 uppercase tracking-wider">Stream files directly to Cloudinary and catalog them automatically</p>
              </div>

              <form onSubmit={handleFileUpload} className="w-full space-y-6">
                
                {/* Folder Selector */}
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-wider text-neutral-400 font-sans block font-semibold">Select Destination Folder</label>
                  <select
                    value={uploadFolder}
                    onChange={(e) => setUploadFolder(e.target.value)}
                    className="w-full bg-white dark:bg-neutral-850 border border-neutral-300 dark:border-neutral-750 px-3 py-2 text-xs font-sans text-[#181818] dark:text-white focus:outline-none"
                  >
                    <option value="media_library">MEDIA LIBRARY (GENERAL)</option>
                    <option value="products">PRODUCTS CATALOG</option>
                    <option value="homepage">HOMEPAGE SLIDES</option>
                    <option value="lookbooks">LOOKBOOK PDFS</option>
                  </select>
                </div>

                {/* File picker drop area */}
                <div className="border border-dashed border-[#D9C7A3] bg-primary dark:bg-neutral-900 p-8 text-center flex flex-col items-center justify-center space-y-3 cursor-pointer relative hover:border-[#B68D40] transition-colors group">
                  <input
                    type="file"
                    required
                    onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Upload className="w-8 h-8 text-[#B68D40] group-hover:scale-105 transition-transform" />
                  
                  {uploadFile ? (
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-[#181818] dark:text-white">{uploadFile.name}</p>
                      <p className="text-[9px] font-mono text-neutral-400 uppercase">{(uploadFile.size / 1024 / 1024).toFixed(2)} MB • {uploadFile.type}</p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-neutral-600 dark:text-neutral-300">Drag files here or click to browse</p>
                      <p className="text-[9px] text-neutral-400 uppercase tracking-widest">Supports JPG, PNG, WEBP, and MP4 (Max 15MB)</p>
                    </div>
                  )}
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={uploading || !uploadFile}
                  className="w-full bg-[#181818] hover:bg-[#B68D40] text-[#D4AF37] hover:text-[#181818] border border-[#B68D40] py-3.5 text-[10px] font-sans font-bold tracking-widest uppercase transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                >
                  {uploading ? (
                    <>
                      <div className="border border-t-white border-neutral-600 rounded-full w-3.5 h-3.5 animate-spin" />
                      <span>UPLOADING TO COUTURE LIBRARY...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-3.5 h-3.5" />
                      <span>UPLOAD AND CATALOG ASSET</span>
                    </>
                  )}
                </button>

              </form>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
