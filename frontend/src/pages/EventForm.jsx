import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { eventService } from '../services/api';
import { ArrowLeft, Save } from 'lucide-react';

export default function EventForm() {
  const { id } = useParams();
  const isEditMode = !!id;
  const navigate = useNavigate();
  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    if (isEditMode) {
      const fetchEvent = async () => {
        try {
          const response = await eventService.getById(id);
          const data = response.data;
          // Format date for datetime-local input
          if (data.occurredAt) {
            data.occurredAt = new Date(data.occurredAt).toISOString().slice(0, 16);
          }
          reset(data);
        } catch (err) {
          setError('Failed to load event details.');
        } finally {
          setLoading(false);
        }
      };
      fetchEvent();
    }
  }, [id, isEditMode, reset]);

  const onSubmit = async (data) => {
    setSubmitting(true);
    setError('');
    
    // Format date back to ISO for API
    if (data.occurredAt) {
        data.occurredAt = new Date(data.occurredAt).toISOString();
    }

    try {
      if (isEditMode) {
        await eventService.update(id, data);
      } else {
        await eventService.create(data);
      }
      navigate('/events');
    } catch (err) {
      setError('Failed to save event. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>;
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center">
          <button onClick={() => navigate(-1)} className="mr-4 text-gray-400 hover:text-gray-600 transition-colors">
            <ArrowLeft className="h-6 w-6" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{isEditMode ? 'Edit Risk Event' : 'Report New Risk Event'}</h1>
            <p className="mt-1 text-sm text-gray-500">
              {isEditMode ? 'Update the details of this operational risk event.' : 'Fill in the details to report a new operational risk event.'}
            </p>
          </div>
        </div>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-md text-sm border border-red-200">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">Event Title <span className="text-red-500">*</span></label>
              <div className="mt-1">
                <input
                  type="text"
                  id="title"
                  {...register('title', { required: 'Title is required' })}
                  className="input-field"
                />
                {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>}
              </div>
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category <span className="text-red-500">*</span></label>
              <div className="mt-1">
                <select
                  id="category"
                  {...register('category', { required: 'Category is required' })}
                  className="input-field"
                >
                  <option value="">Select a category</option>
                  <option value="IT">IT & Systems</option>
                  <option value="HR">Human Resources</option>
                  <option value="FINANCE">Finance</option>
                  <option value="COMPLIANCE">Compliance & Legal</option>
                  <option value="OPERATIONS">Operations</option>
                </select>
                {errors.category && <p className="mt-1 text-xs text-red-500">{errors.category.message}</p>}
              </div>
            </div>

            <div>
              <label htmlFor="occurredAt" className="block text-sm font-medium text-gray-700">Date of Occurrence <span className="text-red-500">*</span></label>
              <div className="mt-1">
                <input
                  type="datetime-local"
                  id="occurredAt"
                  {...register('occurredAt', { required: 'Date is required' })}
                  className="input-field"
                />
                {errors.occurredAt && <p className="mt-1 text-xs text-red-500">{errors.occurredAt.message}</p>}
              </div>
            </div>

            <div>
              <label htmlFor="severity" className="block text-sm font-medium text-gray-700">Severity <span className="text-red-500">*</span></label>
              <div className="mt-1">
                <select
                  id="severity"
                  {...register('severity', { required: 'Severity is required' })}
                  className="input-field"
                >
                  <option value="">Select severity</option>
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </select>
                {errors.severity && <p className="mt-1 text-xs text-red-500">{errors.severity.message}</p>}
              </div>
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status <span className="text-red-500">*</span></label>
              <div className="mt-1">
                <select
                  id="status"
                  {...register('status', { required: 'Status is required' })}
                  className="input-field"
                >
                  <option value="OPEN">Open</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="RESOLVED">Resolved</option>
                  <option value="CLOSED">Closed</option>
                </select>
                {errors.status && <p className="mt-1 text-xs text-red-500">{errors.status.message}</p>}
              </div>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description <span className="text-red-500">*</span></label>
              <p className="text-xs text-gray-500 mb-1">Provide a detailed account of what happened. This will be analyzed by our AI.</p>
              <div className="mt-1">
                <textarea
                  id="description"
                  rows={5}
                  {...register('description', { required: 'Description is required' })}
                  className="input-field"
                />
                {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description.message}</p>}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary"
            >
              {submitting ? 'Saving...' : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {isEditMode ? 'Update Event' : 'Submit Event'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
