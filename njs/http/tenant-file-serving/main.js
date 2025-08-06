// IMPORTANT: This implementation uses an in-memory cache that is not shared
// between NGINX worker processes. In a production environment with multiple
// worker processes, a shared cache like the NGINX key-value store should
// be used instead.

var versions = {};

function get_version(r, tenant) {
    if (versions[tenant]) {
        r.log(`Using cached version for tenant ${tenant}: ${versions[tenant]}`);
        return Promise.resolve(versions[tenant]);
    }

    return r.subrequest(`/config`, { args: `tenant=${tenant}` })
        .then(function(res) {
            if (res.status !== 200) {
                return Promise.reject("Config service returned an error");
            }
            var version = res.responseText.trim();
            versions[tenant] = version;
            r.log(`Fetched and cached version for tenant ${tenant}: ${version}`);
            return version;
        });
}

function get_file(r) {
    var tenant = r.headersIn.tenant;
    if (!tenant) {
        r.return(400, "Tenant header is missing");
        return;
    }

    get_version(r, tenant)
        .then(function(version) {
            var file_path = `/etc/nginx/njs/http/tenant-file-serving/${tenant}/cert.${version}.cer`;
            r.error(`File path: ${file_path}`);
            r.return(200, require('fs').readFileSync(file_path));
        })
        .catch(function(err) {
            r.error(`Error in get_file: ${err}`);
            r.return(500, "Internal Server Error");
        });
}

function invalidate_cache(r) {
    var tenant = r.args.tenant;
    if (tenant && versions[tenant]) {
        delete versions[tenant];
        r.return(200, `Cache invalidated for tenant ${tenant}`);
    } else {
        r.return(404, "Tenant not found in cache");
    }
}

export default {get_file, invalidate_cache};
