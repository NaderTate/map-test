import { useState, useEffect } from "react";

export const useFetchCompounds = () => {
  const [compounds, setCompounds] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchCompounds = async () => {
      try {
        const response = await fetch(
          "https://aleen-server.wessal.app/api/properties/compounds"
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        // remove the compounds with the status "sold"
        setCompounds(
          data.compounds.filter(
            (compound: Project) => compound.status !== "sold"
          )
        );
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("An unknown error occurred")
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCompounds();
  }, []);

  return { compounds, loading, error };
};
