// lib/utils/test-auth.ts
// This is a utility file to test authentication functionality
// Remove this file in production

export async function testAuthFlow() {
  try {
    // Test getting profile without authentication
    const profileResponse = await fetch('/api/auth/profile', {
      credentials: 'include'
    });

    console.log('Profile without auth:', profileResponse.status);

    if (profileResponse.status === 401) {
      console.log('✅ Authentication is working - unauthorized access blocked');
    } else {
      console.log('❌ Authentication issue - unauthorized access allowed');
    }

    // Test favorites without authentication
    const favoritesResponse = await fetch('/api/rooms/favorites', {
      method: 'GET',
      credentials: 'include'
    });

    console.log('Favorites without auth:', favoritesResponse.status);

    if (favoritesResponse.status === 401) {
      console.log('✅ Favorites endpoint protected');
    } else {
      console.log('❌ Favorites endpoint not protected');
    }

  } catch (error) {
    console.error('Test failed:', error);
  }
}
