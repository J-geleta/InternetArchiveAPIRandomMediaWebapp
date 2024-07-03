import React, { useState } from 'react';
import Head from 'next/head';
import styles from '../styles/Home.module.css';

const mediaTypeOptions = [
  { id: 'texts', label: 'Texts/PDFs' },
  { id: 'movies', label: 'Videos' }, // Changed from Movies to Videos
  { id: 'audio', label: 'Audio' },
  { id: 'images', label: 'Images' },
  { id: 'software', label: 'Software' },
];

const Home = () => {
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [mediaContent, setMediaContent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mediaError, setMediaError] = useState(false);

  const fetchAndDisplayMedia = async () => {
    if (selectedTypes.length === 0) {
      alert('Please select at least one media type.');
      return;
    }

    setLoading(true);
    setMediaContent(null);
    setMediaError(false);

    const randomTypeIndex = Math.floor(Math.random() * selectedTypes.length);
    const selectedMediaType = selectedTypes[randomTypeIndex];
    const query = `mediatype:${selectedMediaType}`;

    const params = new URLSearchParams({
      q: query,
      'fl[]': 'identifier,title,mediatype,description,format',
      rows: 50,
      page: Math.floor(Math.random() * 100) + 1,
      output: 'json',
    });

    const url = `https://archive.org/advancedsearch.php?${params}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.response.docs.length > 0) {
        const randomIndex = Math.floor(Math.random() * data.response.docs.length);
        const selectedDoc = data.response.docs[randomIndex];
        setMediaContent(selectedDoc);
      } else {
        setMediaError(true);
      }
    } catch (error) {
      console.error('Failed to fetch media:', error);
      setMediaError(true);
    } finally {
      setLoading(false);
    }
  };

  const toggleMediaType = (type) => {
    setSelectedTypes((prevTypes) =>
      prevTypes.includes(type) ? prevTypes.filter((t) => t !== type) : [...prevTypes, type]
    );
  };

  const renderMediaContent = () => {
    if (!mediaContent && !mediaError) {
      return (
        <p className={styles.initialMessage}>
          This tool pulls random media selections using the Internet Archive API. Narrow down your search using the buttons above to specify media type. I hope you discover something neat today!
        </p>
      );
    }

    if (mediaError) {
      return <p className={styles.error}>No media found for the selected type. Please try again.</p>;
    }

    return (
      <iframe
        src={`https://archive.org/details/${mediaContent.identifier}`}
        className={styles.mediaFrame}
        title="Media Content"
        allowFullScreen
      ></iframe>
    );
  };

  return (
    <>
      <Head>
        <title>Random Media Generator</title>
      </Head>
      <div className={styles.container}>
        <h1 className={styles.title}>Discover Random Media from the Internet Archive</h1>
        <div className={styles.options}>
          {mediaTypeOptions.map(({ id, label }) => (
            <label key={id} className={styles.optionLabel}>
              <input
                type="checkbox"
                checked={selectedTypes.includes(id)}
                onChange={() => toggleMediaType(id)}
              />
              <span className={styles.optionText}>{label}</span> {/* Added span for styling */}
            </label>
          ))}
        </div>
        <button onClick={fetchAndDisplayMedia} disabled={loading} className={styles.button}>
          {loading ? 'Loading...' : 'Show Me Random Media'}
        </button>
        <div className={styles.mediaContainer}>
          {renderMediaContent()}
        </div>
      </div>
    </>
  );
};

export default Home;
