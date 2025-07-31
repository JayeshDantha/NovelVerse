// client/src/pages/ProfilePage.jsx - FINAL MERGED VERSION (Corrected)

import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Container, Typography, Box, Avatar, Button, Paper, Tabs, Tab, CircularProgress, Divider,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Tooltip,
  Snackbar, Alert
} from '@mui/material';
import { CakeOutlined, CalendarTodayOutlined } from '@mui/icons-material';
import VerifiedIcon from '@mui/icons-material/Verified';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

import api from '../api/api';
import PostCard from '../components/PostCard';
import { AuthContext } from '../context/AuthContext';
import { useSnackbar } from 'notistack';
import BookshelfCard from '../components/BookshelfCard';
import ProgressUpdateModal from '../components/ProgressUpdateModal';

// Helper component for Tab Panels
function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} id={`tabpanel-${index}`} {...other}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

function ProfilePage() {
  const { username } = useParams();
  const { user: currentUser, login, updateUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const { enqueueSnackbar } = useSnackbar();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [bookshelf, setBookshelf] = useState([]);
  const [tabIndex, setTabIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({});
  const [uploading, setUploading] = useState(false);
  const [imgSrc, setImgSrc] = useState('');
  const [crop, setCrop] = useState();
  const [aspect, setAspect] = useState(1 / 1);
  const [imageType, setImageType] = useState('profilePicture');
  const imgRef = useRef(null);
  const [progressModalOpen, setProgressModalOpen] = useState(false);
  const [selectedShelfItem, setSelectedShelfItem] = useState(null);
  
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });

  const fetchProfileData = async () => {
    try {
      const [profileRes, bookshelfRes] = await Promise.all([
        api.get(`/users/${username}`),
        api.get(`/books/bookshelf/${username}`)
      ]);
      setProfile(profileRes.data);
      setBookshelf(bookshelfRes.data);
      if(profileRes.data.user && currentUser){
        // --- THIS CHECK ALSO NEEDS TO BE CORRECTED ---
        const amIFollowing = profileRes.data.user.followers?.some(follower => follower._id === currentUser._id);
        setIsFollowing(amIFollowing);
      }
    } catch (err) {
      console.error("Could not fetch profile data", err);
    } finally {
      if (loading) setLoading(false);
    }
  };

  useEffect(() => {
    if (username && currentUser) {
        setLoading(true);
        fetchProfileData();
    }
  }, [username, currentUser]);

  useEffect(() => {
    if (location.state?.message) {
      enqueueSnackbar(location.state.message, { variant: 'success' });
      // Clear the state so the message doesn't reappear on refresh
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, enqueueSnackbar]);

  const handleCloseNotification = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setNotification({ ...notification, open: false });
  };

  const handleOpenProgressModal = (shelfItem) => {
    setSelectedShelfItem(shelfItem);
    setProgressModalOpen(true);
  };
  const handleCloseProgressModal = () => {
    setProgressModalOpen(false);
    setSelectedShelfItem(null);
  };
  const handleSaveProgress = async (progressData) => {
    try {
      await api.put('/books/bookshelf/progress', progressData);
      fetchProfileData();
    } catch (error) {
      console.error("Failed to save progress", error);
    }
  };

  const handleMessage = async () => {
    if (!profile?.user?._id || !currentUser) return;
    try {
      // --- THIS CHECK ALSO NEEDS TO BE CORRECTED ---
      await api.post('/conversations', { senderId: currentUser._id, receiverId: profile.user._id });
      navigate('/chat');
    } catch (err) {
      if (err.response && err.response.status === 403) {
        setNotification({ open: true, message: err.response.data.message, severity: 'error' });
      } else {
        console.error("Failed to start conversation", err);
        setNotification({ open: true, message: 'Could not start conversation.', severity: 'error' });
      }
    }
  };

  const handleFollow = async () => {
    if (!profile?.user?._id) return;
    try {
      setIsFollowing(!isFollowing);
      await api.put(`/users/${profile.user._id}/follow`);
      fetchProfileData();
    } catch (error) { console.error('Failed to follow user', error); setIsFollowing(!isFollowing); }
  };
  const handleTabChange = (event, newValue) => { setTabIndex(newValue); };
  const handleOpen = () => { setFormData({ name: profile.user.name || '', username: profile.user.username || '', bio: profile.user.bio || '', location: profile.user.location || '', website: profile.user.website || '' }); setOpen(true); };
  const handleClose = () => { setOpen(false); setImgSrc(''); };
  const handleChange = (e) => { setFormData({ ...formData, [e.target.name]: e.target.value }); };
  const onSelectFile = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener('load', () => setImgSrc(reader.result.toString() || ''));
      reader.readAsDataURL(e.target.files[0]);
      const type = e.target.name;
      setImageType(type);
      setAspect(type === 'profilePicture' ? 1 / 1 : 16 / 9);
    }
  };
  const onImageLoad = (e) => {
    imgRef.current = e.currentTarget;
    const { width, height } = e.currentTarget;
    const newCrop = centerCrop(makeAspectCrop({ unit: '%', width: 90 }, aspect, width, height), width, height);
    setCrop(newCrop);
  };
  const getCroppedImg = async () => {
    const image = imgRef.current;
    if (!image || !crop || !crop.width || !crop.height) { throw new Error('Crop details are missing'); }
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = Math.floor(crop.width * scaleX);
    canvas.height = Math.floor(crop.height * scaleY);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, crop.x * scaleX, crop.y * scaleY, crop.width * scaleX, crop.height * scaleY, 0, 0, canvas.width, canvas.height);
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) { console.error('Canvas is empty'); return; }
        blob.name = 'cropped.jpeg';
        resolve(blob);
      }, 'image/jpeg');
    });
  };
  const handleSave = async () => {
    setUploading(true);
    try {
      let finalFormData = { ...formData };
      if (imgSrc) {
        const croppedImageBlob = await getCroppedImg();
        const uploadData = new FormData();
        uploadData.append('image', croppedImageBlob);
        const res = await api.post('/upload', uploadData, { headers: { 'Content-Type': 'multipart/form-data' } });
        finalFormData[imageType] = res.data.imageUrl;
      }
      const res = await api.put('/users/profile', finalFormData);
      if (res.data.token) {
        login(res.data.token);
      }
      if (res.data.user) {
        updateUser(res.data.user);
      }
      handleClose();
      fetchProfileData();
      if (finalFormData.username && finalFormData.username !== username) {
        navigate(`/profile/${finalFormData.username}`);
      }
    } catch (error) {
      console.error("Failed to update profile", error);
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <CircularProgress sx={{ display: 'block', margin: 'auto', mt: 4 }} />;
  if (!profile) return <Typography>User not found.</Typography>;

  // --- THIS IS THE FIX ---
  // We now compare `currentUser._id` to `profile.user._id`
  const isOwnProfile = currentUser && currentUser._id === profile.user._id;

  const wantToReadBooks = bookshelf.filter(item => item.status === 'want_to_read');
  const readingBooks = bookshelf.filter(item => item.status === 'reading');
  const readBooks = bookshelf.filter(item => item.status === 'read');

  return (
    <Container maxWidth="md">
      <Paper elevation={2} sx={{ my: 4, borderRadius: '16px', overflow: 'hidden' }}>
        <Box>
            <Box sx={{ height: '200px', bgcolor: 'primary.light', backgroundImage: `url(${profile.user.coverPhoto})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
            <Box sx={{ p: { xs: 2, sm: 3 }, position: 'relative' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mt: '-75px' }}>
                    <Avatar src={profile.user.profilePicture} sx={{ width: 140, height: 140, border: '4px solid white' }}>
                        {!profile.user.profilePicture && profile.user.username.charAt(0).toUpperCase()}
                    </Avatar>
                    {isOwnProfile ? (
                        <Button onClick={handleOpen} variant="outlined" sx={{ borderRadius: '20px', fontWeight: 'bold' }}>Edit Profile</Button>
                    ) : (
                        <Box>
                          <Button onClick={handleFollow} variant={isFollowing ? "outlined" : "contained"} sx={{ borderRadius: '20px' }}>{isFollowing ? "Following" : "Follow"}</Button>
                          <Button variant="contained" onClick={handleMessage} sx={{ ml: 1, borderRadius: '20px' }}>Message</Button>
                        </Box>
                    )}
                </Box>
                 <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="h5" fontWeight="bold">{profile.user.name || profile.user.username}</Typography>
                    {profile.user.isVerified && (
                      <Tooltip title="Verified Account">
                        <VerifiedIcon color="primary" sx={{ verticalAlign: 'middle' }} />
                      </Tooltip>
                    )}
                </Box>
                <Typography variant="body2" color="text.secondary">@{profile.user.username}</Typography>
                {profile.user.bio && <Typography variant="body1" sx={{ mt: 2, whiteSpace: 'pre-wrap' }}>{profile.user.bio}</Typography>}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2, color: 'text.secondary' }}>
                    {profile.user.location && <Typography variant='body2'>{profile.user.location}</Typography>}
                    {profile.user.website && <Typography variant='body2' component="a" href={profile.user.website} target="_blank" rel="noopener noreferrer">{profile.user.website}</Typography>}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><CalendarTodayOutlined fontSize="small" /><Typography variant="body2">Joined {new Date(profile.user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}</Typography></Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                    <Typography variant="body2"><Box component="span" fontWeight="bold">{profile.user.following?.length || 0}</Box> Following</Typography>
                    <Typography variant="body2"><Box component="span"fontWeight="bold">{profile.user.followers?.length || 0}</Box> Followers</Typography>
                </Box>
            </Box>
        </Box>
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 1 }}>
          <Tabs value={tabIndex} onChange={handleTabChange} variant="scrollable" scrollButtons="auto" allowScrollButtonsMobile>
            <Tab label={`Posts (${profile.posts?.length || 0})`} />
            <Tab label={`Read (${readBooks.length})`} />
            <Tab label={`Reading (${readingBooks.length})`} />
            <Tab label={`Want to Read (${wantToReadBooks.length})`} />
          </Tabs>
        </Box>

        <Box sx={{ p: { xs: 1, sm: 2 } }}>
            <TabPanel value={tabIndex} index={0}>
                {profile.posts?.length > 0 ? ( profile.posts.map(post => <PostCard key={post._id} post={post} />) ) : ( <Typography color="text.secondary" sx={{textAlign: 'center', p:3}}>This user has no posts yet.</Typography>)}
            </TabPanel>
            <TabPanel value={tabIndex} index={1}>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 2 }}>
                    {readBooks.map(item => <BookshelfCard key={item._id} shelfItem={item} onShelfChange={isOwnProfile ? fetchProfileData : null} />)}
                </Box>
            </TabPanel>
            <TabPanel value={tabIndex} index={2}>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 2 }}>
                    {readingBooks.map(item => <BookshelfCard key={item._id} shelfItem={item} onUpdateProgress={isOwnProfile ? handleOpenProgressModal : null} onShelfChange={isOwnProfile ? fetchProfileData : null} />)}
                </Box>
            </TabPanel>
            <TabPanel value={tabIndex} index={3}>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 2 }}>
                    {wantToReadBooks.map(item => <BookshelfCard key={item._id} shelfItem={item} onShelfChange={isOwnProfile ? fetchProfileData : null} />)}
                </Box>
            </TabPanel>
        </Box>
      </Paper>
      
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>Edit Your Profile</DialogTitle>
        <DialogContent>
          {imgSrc ? (<Box sx={{textAlign: 'center'}}><ReactCrop crop={crop} onChange={c => setCrop(c)} aspect={aspect}><img ref={imgRef} src={imgSrc} onLoad={onImageLoad} style={{maxHeight: '400px'}}/></ReactCrop></Box>
          ) : ( <>
              <Button variant="contained" component="label" fullWidth sx={{my: 1}}>Upload Profile Picture<input type="file" name="profilePicture" hidden onChange={onSelectFile} accept="image/*" /></Button>
              <Button variant="contained" component="label" fullWidth sx={{my: 1}}>Upload Cover Photo<input type="file" name="coverPhoto" hidden onChange={onSelectFile} accept="image/*" /></Button>
            </> )}
          <Divider sx={{my: 2}} />
          <TextField margin="dense" name="name" label="Name" type="text" fullWidth variant="outlined" value={formData.name || ''} onChange={handleChange} />
          <TextField margin="dense" name="username" label="Username" type="text" fullWidth variant="outlined" value={formData.username || ''} onChange={handleChange} />
          <TextField margin="dense" name="bio" label="Bio" type="text" fullWidth multiline rows={3} variant="outlined" value={formData.bio || ''} onChange={handleChange} />
          <TextField margin="dense" name="location" label="Location" type="text" fullWidth variant="outlined" value={formData.location || ''} onChange={handleChange} />
          <TextField margin="dense" name="website" label="Website" type="text" fullWidth variant="outlined" value={formData.website || ''} onChange={handleChange} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={uploading}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" disabled={uploading}>{uploading ? <CircularProgress size={24} color="inherit"/> : 'Save'}</Button>
        </DialogActions>
      </Dialog>

      {selectedShelfItem && (
        <ProgressUpdateModal
          open={progressModalOpen}
          onClose={handleCloseProgressModal}
          shelfItem={selectedShelfItem}
          onSave={handleSaveProgress}
        />
      )}
      
      <Snackbar 
        open={notification.open} 
        autoHideDuration={6000} 
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseNotification} severity={notification.severity} sx={{ width: '100%' }} variant="filled">
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default ProfilePage;
