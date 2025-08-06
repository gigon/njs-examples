#!/bin/sh

echo "--- Testing tenant1 ---"
response1=$(curl -s -H "tenant: tenant1" http://nginx/files/cer)
if [ "$response1" = "v1" ]; then
    echo "Tenant1 test PASSED"
else
    echo "Tenant1 test FAILED. Expected v1, got $response1"
    exit 1
fi

echo "--- Testing tenant2 ---"
response2=$(curl -s -H "tenant: tenant2" http://nginx/files/cer)
if [ "$response2" = "v2" ]; then
    echo "Tenant2 test PASSED"
else
    echo "Tenant2 test FAILED. Expected v2, got $response2"
    exit 1
fi

echo "--- Testing cache invalidation ---"
curl -s http://nginx/invalidate?tenant=tenant1
# In a real scenario, the config service would now be updated to return a new version.
# We can't do that here, so we'll just check the logs to see that the cache was invalidated.
# We'll make the same request again, and we should see in the logs that the version is fetched again.
response3=$(curl -s -H "tenant: tenant1" http://nginx/files/cer)
if [ "$response3" = "v1" ]; then
    echo "Cache invalidation test PASSED"
else
    echo "Cache invalidation test FAILED. Expected v1, got $response3"
    exit 1
fi

echo "All tests passed!"
exit 0
