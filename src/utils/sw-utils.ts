// Service Worker utility functions for better update handling

export const sendMessageToSW = (message: any) => {
  return new Promise((resolve, reject) => {
    const messageChannel = new MessageChannel();
    
    messageChannel.port1.onmessage = (event) => {
      if (event.data.error) {
        reject(event.data.error);
      } else {
        resolve(event.data);
      }
    };

    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage(message, [messageChannel.port2]);
    } else {
      reject(new Error('No service worker controller available'));
    }
  });
};

export const skipWaiting = async () => {
  try {
    await sendMessageToSW({ type: 'SKIP_WAITING' });
    return true;
  } catch (error) {
    console.error('Failed to skip waiting:', error);
    return false;
  }
};

export const forceUpdate = async () => {
  try {
    console.log('🔄 Starting force update process...');
    
    // In development mode, there might not be a real update
    // So we'll simulate the update process
    if (navigator.serviceWorker.controller) {
      console.log('📨 Sending SKIP_WAITING message...');
      navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
      
      // Wait a brief moment for the message to be processed
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log('🔄 Reloading page...');
    window.location.reload();
    
  } catch (error) {
    console.error('❌ Force update failed:', error);
    // Fallback: just reload immediately
    console.log('🔄 Fallback: direct reload...');
    window.location.reload();
  }
};