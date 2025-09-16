/**
 * Rate Limiting Test Script
 * Tests the rate limiting functionality to ensure it works correctly
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3001';
const TEST_ENDPOINT = '/';

/**
 * Test rate limiting by making multiple requests
 */
async function testRateLimiting() {
  console.log('🧪 Testing Rate Limiting...\n');
  
  try {
    // Test 1: Make requests within the limit
    console.log('📊 Test 1: Making requests within rate limit (5 requests)...');
    for (let i = 1; i <= 5; i++) {
      try {
        const response = await axios.get(`${BASE_URL}${TEST_ENDPOINT}`);
        console.log(`   Request ${i}: ${response.status} - ${response.data.message}`);
      } catch (error) {
        console.log(`   Request ${i}: ${error.response?.status || 'ERROR'} - ${error.message}`);
      }
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log('\n⏳ Waiting 2 seconds before next test...\n');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Test 2: Make many requests to trigger rate limiting
    console.log('🚨 Test 2: Making many requests to trigger rate limiting (20 requests)...');
    let successCount = 0;
    let rateLimitedCount = 0;
    
    for (let i = 1; i <= 20; i++) {
      try {
        const response = await axios.get(`${BASE_URL}${TEST_ENDPOINT}`);
        if (response.status === 200) {
          successCount++;
        }
        console.log(`   Request ${i}: ${response.status} - ${response.data.message || 'Rate limited'}`);
      } catch (error) {
        if (error.response?.status === 429) {
          rateLimitedCount++;
          console.log(`   Request ${i}: ${error.response.status} - ${error.response.data.message}`);
        } else {
          console.log(`   Request ${i}: ${error.response?.status || 'ERROR'} - ${error.message}`);
        }
      }
      // Very small delay between requests
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    console.log('\n📈 Test Results:');
    console.log(`   Successful requests: ${successCount}`);
    console.log(`   Rate limited requests: ${rateLimitedCount}`);
    console.log(`   Total requests: ${successCount + rateLimitedCount}`);
    
    // Test 3: Check rate limit headers
    console.log('\n🔍 Test 3: Checking rate limit headers...');
    try {
      const response = await axios.get(`${BASE_URL}${TEST_ENDPOINT}`);
      console.log('   Rate limit headers:');
      console.log(`   RateLimit-Limit: ${response.headers['ratelimit-limit'] || 'Not set'}`);
      console.log(`   RateLimit-Remaining: ${response.headers['ratelimit-remaining'] || 'Not set'}`);
      console.log(`   RateLimit-Reset: ${response.headers['ratelimit-reset'] || 'Not set'}`);
    } catch (error) {
      console.log(`   Error checking headers: ${error.message}`);
    }
    
    // Test 4: Test health check exemption
    console.log('\n🏥 Test 4: Testing health check exemption...');
    try {
      const response = await axios.get(`${BASE_URL}/healthz`);
      console.log(`   Health check: ${response.status} - ${response.data.status}`);
    } catch (error) {
      console.log(`   Health check error: ${error.message}`);
    }
    
    console.log('\n✅ Rate limiting test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

/**
 * Test different rate limiters
 */
async function testDifferentLimiters() {
  console.log('\n🔧 Testing Different Rate Limiters...\n');
  
  const limiters = [
    { name: 'General', endpoint: '/', expectedLimit: 100 },
    { name: 'Health Check', endpoint: '/healthz', expectedLimit: 'exempt' },
    { name: 'Readiness', endpoint: '/readyz', expectedLimit: 'exempt' },
  ];
  
  for (const limiter of limiters) {
    console.log(`📊 Testing ${limiter.name} limiter (${limiter.endpoint})...`);
    
    try {
      const response = await axios.get(`${BASE_URL}${limiter.endpoint}`);
      console.log(`   Status: ${response.status}`);
      console.log(`   RateLimit-Limit: ${response.headers['ratelimit-limit'] || 'Not set'}`);
      console.log(`   RateLimit-Remaining: ${response.headers['ratelimit-remaining'] || 'Not set'}`);
    } catch (error) {
      console.log(`   Error: ${error.response?.status || 'ERROR'} - ${error.message}`);
    }
    
    console.log('');
  }
}

// Run the tests
if (require.main === module) {
  console.log('🚀 Starting Rate Limiting Tests...\n');
  console.log('Make sure the server is running on port 3001\n');
  
  testRateLimiting()
    .then(() => testDifferentLimiters())
    .then(() => {
      console.log('\n🎉 All tests completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Test suite failed:', error.message);
      process.exit(1);
    });
}

module.exports = {
  testRateLimiting,
  testDifferentLimiters,
};
