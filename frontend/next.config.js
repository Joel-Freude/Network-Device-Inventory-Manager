const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.resolve.alias['mapbox-gl'] = 'maplibre-gl'
    return config
  },
  turbopack: {
    resolveAlias: {
      'mapbox-gl': 'maplibre-gl'
    }
  }
}

module.exports = nextConfig
