import { useState, useEffect } from "react";
import { Plus, X, Trophy } from "lucide-react";
import Button from "./Button";
import GridContainer from "./GridContainer";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1";

const SportsRolesInput = ({ 
  value = [], 
  onChange
}) => {
  const [currentSport, setCurrentSport] = useState("");
  const [currentRole, setCurrentRole] = useState("");
  const [availableSports, setAvailableSports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSports();
  }, []);

  const fetchSports = async () => {
    try {
      const response = await fetch(`${API_BASE}/sports`);
      const data = await response.json();
      if (data.success) {
        setAvailableSports(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch sports:", error);
    } finally {
      setLoading(false);
    }
  };

  const selectedSportData = availableSports.find(s => s._id === currentSport);
  const availableRoles = selectedSportData?.roles || [];
  const isTeamBased = selectedSportData?.teamBased || false;

  const handleAddSport = () => {
    // Role is optional for all sports
    if (currentSport) {
      // Check if sport already exists
      const sportExists = value.some((s) => {
        const existingSportId = typeof s.sport === 'string' ? s.sport : s.sport?._id;
        return existingSportId === currentSport;
      });
      
      if (!sportExists) {
        const sportData = availableSports.find(s => s._id === currentSport);
        const sportEntry = { sport: sportData };
        if (currentRole) {
          sportEntry.role = currentRole;
        }
        onChange([...value, sportEntry]);
        setCurrentSport("");
        setCurrentRole("");
      }
    }
  };

  const handleRemoveSport = (index) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const handleSportChange = (e) => {
    setCurrentSport(e.target.value);
    setCurrentRole(""); // Reset role when sport changes
  };

  return (
    <div className="space-y-4">
      {/* Add Sport Section */}
      <div className="flex gap-2 items-center">
        <select
          value={currentSport}
          onChange={handleSportChange}
          disabled={loading}
          className="flex-3 px-4 py-3 bg-card-background dark:bg-card-background-dark border border-base-dark dark:border-base rounded-lg text-text-primary dark:text-text-primary-dark focus:outline-none focus:ring-2 focus:ring-secondary dark:focus:ring-secondary-dark disabled:opacity-50"
        >
          <option value="">{loading ? "Loading sports..." : "Select Sport"}</option>
          {availableSports.map((sport) => (
            <option key={sport._id} value={sport._id}>
              {sport.name}
            </option>
          ))}
        </select>
        {isTeamBased && (
          <select
            value={currentRole}
            onChange={(e) => setCurrentRole(e.target.value)}
            disabled={!currentSport || loading}
            className="flex-3 px-4 py-3 bg-card-background dark:bg-card-background-dark border border-base-dark dark:border-base rounded-lg text-text-primary dark:text-text-primary-dark focus:outline-none focus:ring-2 focus:ring-secondary dark:focus:ring-secondary-dark disabled:opacity-50"
          >
            <option value="">Select Role (optional)</option>
            {availableRoles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        )}
        <Button
          type="button"
          onClick={handleAddSport}
          disabled={!currentSport || loading}
          variant="primary"
          className="px-4 py-3 flex-1 items-center gap-2"
        >
          <Plus size={18} />
          Add
        </Button>
      </div>

      {/* Selected Sports Display */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {value.map((sportItem, index) => {
            // Handle different sport data formats
            let sportName;
            if (typeof sportItem.sport === 'string') {
              // If sport is an ID string, look it up in availableSports
              const foundSport = availableSports.find(s => s._id === sportItem.sport);
              sportName = foundSport?.name || sportItem.sport;
            } else {
              // If sport is an object, get the name
              sportName = sportItem.sport?.name;
            }
            
            return (
              <div
                key={index}
                className="flex items-center gap-2 px-4 py-2 bg-secondary/10 dark:bg-secondary-dark/10 border border-secondary/20 dark:border-secondary-dark/20 rounded-lg group hover:bg-secondary/20 dark:hover:bg-secondary-dark/20 transition-colors"
              >
                <Trophy size={16} className="text-secondary dark:text-secondary-dark" />
                <span className="text-text-primary dark:text-text-primary-dark font-medium">
                  {sportName}
                </span>
                {sportItem.role && (
                  <>
                    <span className="text-base dark:text-base-dark">-</span>
                    <span className="text-base dark:text-base-dark">
                      {sportItem.role}
                    </span>
                  </>
                )}
                <button
                  type="button"
                  onClick={() => handleRemoveSport(index)}
                  className="ml-2 text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {value.length === 0 && (
        <div className="text-center py-6 border-2 border-dashed border-base-dark dark:border-base rounded-lg">
          <Trophy size={32} className="mx-auto mb-2 text-base dark:text-base-dark" />
          <p className="text-sm text-base dark:text-base-dark">
            No sports added yet. Add your sports and roles above.
          </p>
        </div>
      )}
    </div>
  );
};

export default SportsRolesInput;
