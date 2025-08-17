# -*- encoding: utf-8 -*-
# stub: htmlcompressor 0.4.0 ruby lib

Gem::Specification.new do |s|
  s.name = "htmlcompressor".freeze
  s.version = "0.4.0".freeze

  s.required_rubygems_version = Gem::Requirement.new(">= 0".freeze) if s.respond_to? :required_rubygems_version=
  s.require_paths = ["lib".freeze]
  s.authors = ["Paolo Chiodi".freeze]
  s.date = "2017-12-28"
  s.description = "Put your html on a diet".freeze
  s.email = ["chiodi84@gmail.com".freeze]
  s.homepage = "".freeze
  s.rubygems_version = "2.0.14.1".freeze
  s.summary = "htmlcompressor provides a class and a rack middleware to minify html pages".freeze

  s.installed_by_version = "3.6.9".freeze

  s.specification_version = 4

  s.add_development_dependency(%q<yui-compressor>.freeze, ["~> 0.9".freeze])
  s.add_development_dependency(%q<closure-compiler>.freeze, ["~> 1.1".freeze])
  s.add_development_dependency(%q<rake>.freeze, ["~> 10.3.2".freeze])
  s.add_development_dependency(%q<minitest>.freeze, ["~> 5.0".freeze])
end
