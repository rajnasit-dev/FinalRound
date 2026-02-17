import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import { motion } from "framer-motion";
import TournamentCard from "../../components/ui/TournamentCard";
import FeedbackCard from "../../components/ui/FeedbackCard";
import FeedbackForm from "../../components/ui/FeedbackForm";
import Button from "../../components/ui/Button";
import Spinner from "../../components/ui/Spinner";
import ErrorMessage from "../../components/ui/ErrorMessage";
import Modal from "../../components/ui/Modal";
import GridContainer from "../../components/ui/GridContainer";
import useDateFormat from "../../hooks/useDateFormat";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1";

const fadeInUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
};

const staggerContainer = {
  initial: {},
  animate: { transition: { staggerChildren: 0.1 } },
};

const staggerItem = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
};

const Home = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [liveTournaments, setLiveTournaments] = useState([]);
  const [liveMatches, setLiveMatches] = useState([]);
  const [upcomingTournaments, setUpcomingTournaments] = useState([]);
  const [sports, setSports] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [videoLoaded, setVideoLoaded] = useState(false);

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    try {
      setLoading(true);
      // Fetch all data in parallel
      const [
        liveTournamentsRes,
        liveMatchesRes,
        upcomingTournamentsRes,
        sportsRes,
        reviewsRes,
      ] = await Promise.all([
        axios.get(`${API_BASE_URL}/tournaments/live`, {
          withCredentials: true,
        }),
        axios.get(`${API_BASE_URL}/matches/live`, { withCredentials: true }),
        axios.get(`${API_BASE_URL}/tournaments/upcoming?limit=4`, {
          withCredentials: true,
        }),
        axios.get(`${API_BASE_URL}/sports`, { withCredentials: true }),
        axios.get(`${API_BASE_URL}/feedback/latest-by-role`, {
          withCredentials: true,
        }),
      ]);

      setLiveTournaments(liveTournamentsRes.data.data || []);
      setLiveMatches(liveMatchesRes.data.data || []);
      setUpcomingTournaments(upcomingTournamentsRes.data.data || []);
      setSports(sportsRes.data.data || []);
      setReviews(reviewsRes.data.data || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching home data:", err);
      setError(
        err.response?.data?.message || err.message || "Failed to load data",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSuccess = () => {
    setShowReviewForm(false);
    fetchHomeData();
  };
  const { formatDate, formatTime } = useDateFormat();

  const formatMatchTime = (scheduledAt, status) => {
    if (status === "Live") return "LIVE NOW";
    if (status === "Completed") return "Full Time";

    const matchDate = new Date(scheduledAt);
    const now = new Date();
    const diffInMinutes = Math.floor((matchDate - now) / (1000 * 60));

    if (diffInMinutes < 60 && diffInMinutes > 0) {
      return `Starting in ${diffInMinutes} min`;
    }
    // Default: show formatted date and time
    return `${formatDate(matchDate)} ${formatTime(matchDate)}`;
  };

  const getMatchesForTournament = (tournamentId) => {
    return liveMatches.filter(
      (match) => match.tournament?._id === tournamentId,
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden">
      {/* Hero Section - Gradient Background */}
      <div className="relative w-full h-screen overflow-hidden">
        {/* Poster Image - shown until video loads */}
        {!videoLoaded && (
          <img
            src="https://res.cloudinary.com/dggwds1xm/image/upload/v1770136100/Video_Project_uu9ctk.jpg"
            alt="Hero Background"
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        {/* Video Background */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          onLoadedData={() => setVideoLoaded(true)}
          onLoadedMetadata={(e) => {
            e.target.playbackRate = 0.85;
          }}
        >
          <source src="https://res.cloudinary.com/dggwds1xm/video/upload/v1770136100/Video_Project_uu9ctk.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-linear-to-t from-black to-transparent"></div>

        {/* Hero Section - Content */}
        <div className="absolute inset-0 z-10 container mx-auto px-4 py-3 flex items-center">
          <motion.div
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <h1 className="text-5xl md:text-6xl text-text-secondary font-bold mb-6">
              Organize & Join{" "}
              <span className="text-accent">Sports Tournaments</span> Easily
            </h1>
            <motion.p
              className="text-lg md:text-xl max-w-2xl mb-8 text-text-secondary"
              variants={fadeInUp}
              transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
            >
              SportsHub helps players, team managers, and organizers manage
              tournaments, teams, and matches in one place.
            </motion.p>
            {!user && (
              <div className="flex gap-4 flex-wrap">
                <Button
                  onClick={() => navigate("/register")}
                  className="!w-auto px-8 shadow-lg"
                >
                  Get Started
                </Button>
              </div>
            )}
          </motion.div>
        </div>

        {/* Curved Divider at bottom of video */}
        <div className="absolute bottom-0 w-full">
          <svg
            className="w-full h-64"
            viewBox="0 0 1440 120"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"
              className="fill-primary dark:fill-primary-dark"
            />
          </svg>
        </div>
      </div>

      {/* Trending Live Tournament Section */}
      <section className="relative py-6">
        <div className="max-w-7xl mx-auto px-6">
          {error && <ErrorMessage message={error} type="error" />}
        </div>
      </section>

      {/* Upcoming Tournaments Section */}
      <section className="relative py-16 bg-primary dark:bg-primary-dark">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold mb-8 text-text-primary dark:text-text-primary-dark">
            Upcoming Tournaments
          </h2>

          {upcomingTournaments.length === 0 ? (
            <div className="bg-card-background dark:bg-card-background-dark rounded-xl border border-base-dark dark:border-base p-8 text-center">
              <p className="text-xl text-base dark:text-base-dark">
                No upcoming tournaments scheduled yet.
              </p>
            </div>
          ) : (
            <motion.div
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true, margin: "-100px" }}
            >
              <GridContainer cols={3}>
                {upcomingTournaments.slice(0, 3).map((tournament) => {
                  return (
                    <motion.div key={tournament._id} variants={staggerItem}>
                      <TournamentCard tournament={tournament} />
                    </motion.div>
                  );
                })}
              </GridContainer>
            </motion.div>
          )}

          <div className="mt-8 flex justify-center">
            <Button
              onClick={() => navigate("/tournaments")}
              variant="primary"
              className="!w-auto px-8"
            >
              View All Upcoming Tournaments
            </Button>
          </div>
        </div>
      </section>

      {/* Customer Reviews Section */}
      <section className="relative py-16 bg-primary dark:bg-primary-dark">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-2 text-text-primary dark:text-text-primary-dark">
                What Our Users Say
              </h2>
              <p className="text-base dark:text-base-dark">
                Hear from players, managers, and organizers who are using
                SportsHub
              </p>
            </div>
            {!showReviewForm && (
              <Button
                onClick={() => {
                  if (!user) {
                    navigate("/login");
                  } else {
                    setShowReviewForm(true);
                  }
                }}
                variant="primary"
                className="!w-auto px-8"
              >
                Write a Review
              </Button>
            )}
          </div>

          {showReviewForm && (
            <Modal onClose={() => setShowReviewForm(false)}>
              <div className="p-6">
                <h3 className="text-2xl font-bold mb-4 text-text-primary dark:text-text-primary-dark">
                  Write a Review
                </h3>
                <FeedbackForm onSuccess={handleReviewSuccess} />
              </div>
            </Modal>
          )}

          {reviews.length === 0 ? (
            <div className="bg-card-background dark:bg-card-background-dark rounded-xl border border-base-dark dark:border-base p-8 text-center">
              <p className="text-xl text-base dark:text-base-dark">
                No reviews yet. Be the first to share your experience!
              </p>
              {!user && (
                <Button
                  onClick={() => navigate("/login")}
                  variant="primary"
                  className="w-auto mt-4"
                >
                  Login to Write a Review
                </Button>
              )}
            </div>
          ) : (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true, margin: "-100px" }}
            >
              {reviews.slice(0, 3).map((review) => (
                <motion.div key={review._id} variants={staggerItem}>
                  <FeedbackCard feedback={review} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* Call to Action Section */}
      {!user && (
        <section className="relative py-16 bg-card-background dark:bg-card-background-dark border-y border-base-dark dark:border-base">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <motion.h2
              className="text-4xl md:text-5xl font-bold mb-6 text-text-primary dark:text-text-primary-dark"
              variants={fadeInUp}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              Ready to Join the Action?
            </motion.h2>
            <motion.p
              className="text-lg md:text-xl mb-8 text-base dark:text-base-dark"
              variants={fadeInUp}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Whether you're a player, team manager, or tournament organizer,
              SportsHub has everything you need to succeed.
            </motion.p>
            <div className="flex justify-center">
              <Button
                onClick={() => navigate("/register")}
                className="!w-auto px-10 py-4 shadow-lg text-lg"
              >
                Get Started
              </Button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;
