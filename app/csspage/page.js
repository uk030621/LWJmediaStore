'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import YouTube from 'react-youtube'; // Import YouTube component from 'react-youtube'

export default function Home() {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [displayedImageUrl, setDisplayedImageUrl] = useState('');
  const [storedUrls, setStoredUrls] = useState([]);
  const [error, setError] = useState('');
  const [imageIndex, setImageIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUrls, setFilteredUrls] = useState([]);
  const [loading, setLoading] = useState(true);

  const collectionRoute = '/api/urlcss'
  const pageName = 'Learn'

  const imageUrls = [
    {url: '/Education.jpg', link:'https://www.bing.com/images/search?form=IARRSM&q=taylor+swift&first=1'},
    // Add more images if needed
  ];

  const imageSizes = {
    '/Education.jpg': { width: 250, height: 200 },
    // Define sizes for other images if added
  };

  const getImageSize = (imageName) => {
    return imageSizes[imageName] || { width: 100, height: 100 };
  };

  const selectNextImage = () => {
    setImageIndex((prevIndex) => (prevIndex + 1) % imageUrls.length);
  };

  const handleToggle = (event) => {
    if (event.target.open) {
      selectNextImage();
    }
  };

  const getContentType = (url) => {
    if (isYouTubeUrl(url)) {
      return 'youtube';
    }
    const extension = url.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif'].includes(extension)) {
      return 'image';
    } else if (['mp4', 'webm', 'ogg'].includes(extension)) {
      return 'video';
    } else {
      return 'webpage';
    }
  };

  const isYouTubeUrl = (url) => {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
    return youtubeRegex.test(url) || url.length === 11; // Also treat 11-character strings as YouTube IDs
  };

  const extractYouTubeId = (url) => {
    if (url.length === 11) {
      return url; // Assume it's a raw video ID
    }
    const videoIdMatch = url.match(/(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/);
    return videoIdMatch ? videoIdMatch[1] : null; // Return the video ID or null if no match
  };

  const fetchUrls = async () => {
    try {
      const res = await fetch(collectionRoute);
      if (!res.ok) {
        throw new Error('Failed to fetch URLs');
      }
      const data = await res.json();
      setStoredUrls(data.urls);
      setFilteredUrls(data.urls);
    } catch (err) {
      console.error(err);
      setError('Failed to load media URLs.');
    }
  };

  useEffect(() => {
    fetchUrls();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      setError('Please enter a title.');
      return;
    }

    if (!url.trim()) {
      setError('Please enter a URL or YouTube Video ID.');
      return;
    }

    const contentType = getContentType(url.trim());

    if (contentType === 'youtube') {
      const videoId = extractYouTubeId(url.trim());
      if (!videoId) {
        setError('Invalid YouTube URL or Video ID.');
        return;
      }
    }

    try {
      const res = await fetch(collectionRoute, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim(), title: title.trim() }),
      });

      if (!res.ok) {
        throw new Error('Failed to add media.');
      }

      setUrl('');
      setTitle('');
      setError('');
      fetchUrls();
    } catch (err) {
      console.error(err);
      setError('Failed to add media.');
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(collectionRoute, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) {
        throw new Error('Failed to delete media.');
      }

      fetchUrls();
    } catch (err) {
      console.error(err);
      setError('Failed to delete media.');
    }
  };

  const handleImageClick = (storedUrl) => {
    const contentType = getContentType(storedUrl.url);

    if (contentType === 'image') {
      setDisplayedImageUrl(storedUrl.url);
    } else {
      setDisplayedImageUrl('');
    }
  };

  const renderPreview = (storedUrl) => {
    const contentType = getContentType(storedUrl.url);
  
    switch (contentType) {
      case 'image':
        return (
          <Image
            src={storedUrl.url}
            alt={storedUrl.title}
            style={styles.previewImage}
            onClick={() => handleImageClick(storedUrl)}
            width={200}
            height={200}
          />
        );
      case 'video':
        return (
          <div style={styles.videoContainer}>
            {loading && <p>Loading...</p>} {/* Loading message */}
            <video
              controls
              style={styles.previewVideo}
              onLoadedData={() => setLoading(false)} // Stop loading when video is ready
              onLoadStart={() => setLoading(true)} // Start loading when video starts fetching
            >
              <source src={storedUrl.url} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        );
      case 'youtube': {
        const videoId = extractYouTubeId(storedUrl.url);
        if (!videoId) return <p>Invalid YouTube Video ID</p>;
        return (
          <>
            {loading && <p>Loading...</p>} {/* Loading message */}
            <YouTube
              videoId={videoId}
              opts={{
                width: '100%',
                height: '200px',
                playerVars: {
                  autoplay: 0,
                  modestbranding: 1,
                },
              }}
              onReady={() => setLoading(false)} // Stop loading once YouTube player is ready
              onPlay={() => setLoading(false)}  // Stop loading when video plays
              onStateChange={(e) => {
                if (e.data === 1) setLoading(false); // Playing state
                if (e.data === 3) setLoading(true);  // Buffering state
              }}
            />
          </>
        );
      }
      default:
        return (
          <div style={styles.webpagePreview}>
            <p>{storedUrl.title}</p>
            <a href={storedUrl.url} target="_blank" rel="noopener noreferrer" style={styles.previewLink}>
              Open Website
            </a>
          </div>
        );
    }
  };
  

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredUrls(storedUrls);
    } else {
      const filtered = storedUrls.filter((storedUrl) =>
        storedUrl.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUrls(filtered);
    }
  }, [searchTerm, storedUrls]);

  const handleReset = () => {
    setSearchTerm('');
    setFilteredUrls(storedUrls);
  };

  return (
    <div style={styles.container}>
      {/* Navigation Links */}
      <div style={{ marginTop: '10px', marginBottom: '20px', fontWeight: 'lighter' }}>
        <p>
          <Link href='/'><span className='link'>Music</span></Link>
          <Link href='/htmlpage'><span className='link'>Film</span></Link>
          <Link href='/csspage'><span className='link'>Learn</span></Link>
          <Link href='/javascriptpage'><span className='link'>News</span></Link>
          <Link href='/reactpage'><span className='link'>Code</span></Link>
          <Link href='/miscpage'><span className='link'>Misc</span></Link>
        </p>
      </div>

      {/* Title */}
      <h2 style={styles.title}>
        LWJ&apos;s <span style={{ fontSize: '1.3rem', color: 'grey' }}>{pageName}</span> Media Repository
      </h2>

      {/* Details with Image Carousel */}
      <details onToggle={handleToggle} style={{ textAlign: 'left', marginBottom: '10px' }}>
        <summary style={{ color: 'grey', cursor: 'pointer', fontFamily: 'arial', fontSize: '1rem' }}>
          {pageName} 🖥️
        </summary>
        <div style={{ marginLeft: '0px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {/* Link to the URL associated with the current image */}
          <a href={imageUrls[imageIndex].link} target="_blank" rel="noopener noreferrer">
            <Image
              className='uk-pic'
              src={imageUrls[imageIndex].url} // Use the sequential image URL
              alt="Portfolio Image"
              width={getImageSize(imageUrls[imageIndex].url).width} // Dynamically set width
              height={getImageSize(imageUrls[imageIndex].url).height} // Dynamically set height
              priority={true}
              style={{
                marginLeft: '5px',
                marginRight: '5px',
                marginBottom: '15px',
                borderRadius: '10px',
                border: '2px solid black',
              }}
            />
          </a>
        </div>
      </details>

      {/* Displayed Image */}
      {displayedImageUrl && (
        <Image
          src={displayedImageUrl}
          alt="Displayed Media"
          style={styles.image}
          width={600}
          height={400}
        />
      )}

      {/* Submission Form */}
      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="text"
          placeholder="Enter a title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={styles.input}
        />
        <input
          type="text"
          placeholder="Enter media URL or YouTube Video ID"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          style={styles.input}
        />
        {error && <p style={styles.error}>{error}</p>}

        <div style={{ display: 'flex', justifyContent: 'flex-start', width: '100%' }}>
          <button type="submit" style={styles.button}>Add Media</button>
        </div>
      </form>

      {/* Search functionality */}
      <input className='search-input'
        type="text"
        placeholder="Search by title..."
        value={searchTerm}
        onChange={handleSearchChange}
        style={styles.input}
      />
      <button onClick={handleReset} style={styles.resetbutton}>Reset</button>

      {/* Stored Media List */}
      <div style={{ marginTop: '25px' }}>
        <h2 style={styles.subtitle}>Stored Media:</h2>
        <ul style={styles.urlList}>
          {filteredUrls.map((storedUrl) => (
            <li key={storedUrl._id} style={styles.urlItem}>
              <div style={styles.previewContainer}>
                <h3 style={styles.vidTitle}>{storedUrl.title}</h3> {/* Display the title here */}
                {renderPreview(storedUrl)}
                <button
                  onClick={() => handleDelete(storedUrl._id)}
                  style={styles.deleteButton}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}


const styles = {
  container: {
    maxWidth: '600px',
    margin: '0 auto',
    padding: '0 20px',
    textAlign: 'left',
  },

  vidTitle:{
    fontSize: '1rem',
    fontWeight:'300',
    marginBottom: '5px',
    color:'grey'
  },

  loadingText: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#555',
    textAlign: 'center',
    marginBottom: '10px',
  },

  title: {
    fontSize: '1rem',
    marginTop:'10px',
    marginBottom: '10px',
    textAlign:'left',
    color:'grey',
  },
  subtitle: {
    fontSize: '1.3rem',
    marginTop:'10px',
    marginBottom: '10px',
    textAlign:'left',
    color:'grey',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: '20px',
  },
  input: {
    padding: '10px',
    width: '100%',
    marginBottom: '10px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    fontSize:'17px',
  },
  button: {
    padding: '10px 20px',
    backgroundColor: '#0070f3',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },

  resetbutton:{
    padding: '10px 20px',
    backgroundColor: '#0070f3',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  
  image: {
    width: '100%',
    maxHeight: '400px',
    objectFit: 'contain',
    marginBottom: '20px',
  },
  previewImage: {
    width: '100%',
    maxHeight: '200px',
    objectFit: 'cover',
    borderRadius: '4px',
    marginBottom: '10px',
    cursor: 'pointer', // Change cursor to pointer
  },
  previewVideo: {
    width: '100%',
    maxHeight: '200px',
    borderRadius: '15px',
    marginBottom: '10px',
    objectFit: 'cover',    // Optional: Ensures video scales nicely inside the rounded corners
  },
  webpagePreview: {
    padding: '10px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    marginBottom: '10px',
    textAlign: 'left',
  },
  previewLink: {
    color: '#0070f3',
    textDecoration: 'none',
  },
  urlList: {
    listStyleType: 'none',
    padding: 0,
    marginTop: '10px',
  },
  urlItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 0',
    borderBottom: '1px solid #eaeaea',
    wordBreak: 'break-word',
  },
  previewContainer: {
    display: 'flex',
    border:'2px solid grey',
    padding:'15px',
    backgroundColor:'lightblue',
    borderRadius:'8px',
    flexDirection: 'column', // Stack items vertically
    alignItems: 'flex-start', // Left align items
    marginBottom: '10px', // Space between items
  },
  deleteButton: {
    padding: '5px 10px',
    backgroundColor: 'red',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  error: {
    color: 'red',
    fontSize: '14px',
    marginBottom: '10px',
  },
};

