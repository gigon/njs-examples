var versions = {};

async function get_version(r) {
    let tenant = r.headersIn.tenant;
    if (!tenant) {
        r.return(400, "Tenant header is missing");
        return;
    }

    if (versions[tenant]) {
        r.log(`Using cached version for tenant ${tenant}: ${versions[tenant]}`);
        return versions[tenant];
    }

    let res = await r.subrequest(`/config?tenant=${tenant}`);
    if (res.status !== 200) {
        r.return(502, "Config service returned an error");
        return;
    }

    let version = res.responseText.trim();
    versions[tenant] = version;
    r.log(`Fetched and cached version for tenant ${tenant}: ${version}`);
    return version;
}

async function get_file(r) {
    let version = await get_version(r);
    if (version) {
        let tenant = r.headersIn.tenant;
        r.internalRedirect(`/files/${tenant}/cert.${version}.cer`);
    }
}

function invalidate_cache(r) {
    let tenant = r.args.tenant;
    if (tenant && versions[tenant]) {
        delete versions[tenant];
        r.return(200, `Cache invalidated for tenant ${tenant}`);
    } else {
        r.return(404, "Tenant not found in cache");
    }
}

export default {get_file, invalidate_cache};
