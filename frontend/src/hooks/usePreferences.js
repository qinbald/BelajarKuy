import { useState, useEffect, useCallback } from 'react';
import * as preferenceService from '../services/preferenceService';

export function usePreferences() {
  const [preference, setPreference] = useState(null);
  const [hasCompletedSurvey, setHasCompletedSurvey] = useState(true); // default true to prevent flash
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPreferences = useCallback(async () => {
    setLoading(true);
    try {
      const res = await preferenceService.getPreferences();
      setPreference(res.data.data.preference);
      setHasCompletedSurvey(res.data.data.has_completed_survey);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat preferensi');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  const updatePreferences = async (data) => {
    const res = await preferenceService.savePreferences(data);
    setPreference(res.data.data);
    setHasCompletedSurvey(true);
    return res.data.data;
  };

  return { preference, hasCompletedSurvey, loading, error, updatePreferences, refreshPreferences: fetchPreferences };
}
