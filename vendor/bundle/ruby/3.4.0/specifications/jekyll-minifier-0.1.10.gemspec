# -*- encoding: utf-8 -*-
# stub: jekyll-minifier 0.1.10 ruby lib

Gem::Specification.new do |s|
  s.name = "jekyll-minifier".freeze
  s.version = "0.1.10".freeze

  s.required_rubygems_version = Gem::Requirement.new(">= 0".freeze) if s.respond_to? :required_rubygems_version=
  s.require_paths = ["lib".freeze]
  s.authors = ["DigitalSparky".freeze]
  s.date = "2019-01-07"
  s.description = "Jekyll Minifier using htmlcompressor for html, uglifier for js and css".freeze
  s.email = ["matthew@spurrier.com.au".freeze]
  s.homepage = "http://github.com/digitalsparky/jekyll-minifier".freeze
  s.licenses = ["GPL-3.0".freeze]
  s.required_ruby_version = Gem::Requirement.new(">= 2.3.0".freeze)
  s.rubygems_version = "3.0.2".freeze
  s.summary = "Jekyll Minifier for html, css, and javascript".freeze

  s.installed_by_version = "3.6.9".freeze

  s.specification_version = 2

  s.add_runtime_dependency(%q<jekyll>.freeze, [">= 3.5".freeze])
  s.add_runtime_dependency(%q<uglifier>.freeze, ["~> 4.1".freeze])
  s.add_runtime_dependency(%q<htmlcompressor>.freeze, ["~> 0.4".freeze])
  s.add_runtime_dependency(%q<cssminify2>.freeze, ["~> 2.0".freeze])
  s.add_runtime_dependency(%q<json-minify>.freeze, ["~> 0.0.3".freeze])
  s.add_development_dependency(%q<rake>.freeze, ["~> 12.3".freeze])
  s.add_development_dependency(%q<rspec>.freeze, ["~> 3.8".freeze])
  s.add_development_dependency(%q<jekyll-paginate>.freeze, ["~> 1.1".freeze])
  s.add_development_dependency(%q<redcarpet>.freeze, ["~> 3.4".freeze])
end
