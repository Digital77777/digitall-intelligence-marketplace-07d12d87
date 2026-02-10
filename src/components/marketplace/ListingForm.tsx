import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { MarketplaceListing, useMarketplace } from '@/hooks/useMarketplace';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import { MediaUploader } from '@/components/media/MediaUploader';

interface ListingFormProps {
  initialData?: Partial<MarketplaceListing>;
  onSubmit: (data: Partial<MarketplaceListing>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const ListingForm: React.FC<ListingFormProps> = ({ 
  initialData, 
  onSubmit, 
  onCancel, 
  isLoading = false 
}) => {
  const { categories } = useMarketplace();
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    listing_type: initialData?.listing_type || 'product' as const,
    category_id: initialData?.category_id || '',
    price: initialData?.price || 0,
    currency: initialData?.currency || 'USD',
    images: initialData?.images || [],
    videos: initialData?.videos || [],
    creation_link: initialData?.creation_link || '',
    tags: initialData?.tags || [],
    requirements: initialData?.requirements || '',
    delivery_time: initialData?.delivery_time || 1,
  });

  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        listing_type: initialData.listing_type || 'product',
        category_id: initialData.category_id || '',
        price: initialData.price || 0,
        currency: initialData.currency || 'USD',
        images: initialData.images || [],
        videos: initialData.videos || [],
        creation_link: initialData.creation_link || '',
        tags: initialData.tags || [],
        requirements: initialData.requirements || '',
        delivery_time: initialData.delivery_time || 1,
      });
    }
  }, [initialData]);

  const handleInputChange = (field: string, value: string | number | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      const updatedTags = [...formData.tags, newTag.trim()];
      handleInputChange('tags', updatedTags);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    const updatedTags = formData.tags.filter(tag => tag !== tagToRemove);
    handleInputChange('tags', updatedTags);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.description.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.price < 0) {
      toast.error('Please enter a valid price');
      return;
    }

    onSubmit(formData);
  };

  const isValid = formData.title.trim() && formData.description.trim() && formData.price >= 0;

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>
          {initialData ? 'Edit Listing' : 'Create New Listing'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter listing title"
                  required
                />
              </div>

              <div>
                <Label htmlFor="listing_type">Type *</Label>
                <Select 
                  value={formData.listing_type} 
                  onValueChange={(value) => handleInputChange('listing_type', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="product">Product</SelectItem>
                    <SelectItem value="service">Service</SelectItem>
                    <SelectItem value="job">Job</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <Select 
                  value={formData.category_id} 
                  onValueChange={(value) => handleInputChange('category_id', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="price">Price *</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Select 
                    value={formData.currency} 
                    onValueChange={(value) => handleInputChange('currency', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe your offering"
                  className="min-h-[120px]"
                  required
                />
              </div>

              <div>
                <Label htmlFor="creation_link">Creation Link</Label>
                <Input
                  id="creation_link"
                  value={formData.creation_link}
                  onChange={(e) => handleInputChange('creation_link', e.target.value)}
                  placeholder="https://your-creation-link.com"
                />
              </div>

              <div>
                <Label htmlFor="delivery_time">Delivery Time (days)</Label>
                <Input
                  id="delivery_time"
                  type="number"
                  min="1"
                  value={formData.delivery_time}
                  onChange={(e) => handleInputChange('delivery_time', parseInt(e.target.value) || 1)}
                />
              </div>
            </div>
          </div>

          {/* Tags */}
          <div>
            <Label>Tags</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Add a tag"
              />
              <Button type="button" onClick={addTag} disabled={!newTag.trim()}>
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="cursor-pointer">
                  {tag}
                  <X 
                    className="h-3 w-3 ml-1" 
                    onClick={() => removeTag(tag)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          {/* Requirements */}
          <div>
            <Label htmlFor="requirements">Requirements (Optional)</Label>
            <Textarea
              id="requirements"
              value={formData.requirements}
              onChange={(e) => handleInputChange('requirements', e.target.value)}
              placeholder="List any specific requirements for this listing"
            />
          </div>

          {/* Media Upload */}
          <div>
            <Label>Logo & Media (Images & Videos)</Label>
            <p className="text-sm text-muted-foreground mb-2">
              Upload your listing logo/icon as the first image. Additional images and videos showcase your product.
            </p>
            <MediaUploader
              images={formData.images}
              videos={formData.videos}
              onImagesChange={(images) => handleInputChange('images', images)}
              onVideosChange={(videos) => handleInputChange('videos', videos)}
              maxImages={10}
              bucket="marketplace-listings"
              maxVideos={5}
              maxFileSize={50}
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-6">
            <Button 
              type="submit" 
              disabled={!isValid || isLoading}
              className="flex-1"
            >
              {isLoading ? 'Saving...' : initialData ? 'Update Listing' : 'Create Listing'}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};