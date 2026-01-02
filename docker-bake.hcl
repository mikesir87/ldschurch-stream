variable "TAG" {
  default = "latest"
}

variable "REGISTRY_USER" {
  default = "mikesir87"
}

group "default" {
  targets = ["api", "dashboard", "access", "landing"]
}

target "api" {
  context = "./api"
  platforms = ["linux/amd64", "linux/arm64"]
  tags = [
    "${REGISTRY_USER}/ldschurch-stream-api:${TAG}",
    "${REGISTRY_USER}/ldschurch-stream-api:latest"
  ]
}

target "dashboard" {
  context = "./dashboard"
  platforms = ["linux/amd64", "linux/arm64"]
  tags = [
    "${REGISTRY_USER}/ldschurch-stream-dashboard:${TAG}",
    "${REGISTRY_USER}/ldschurch-stream-dashboard:latest"
  ]
}

target "access" {
  context = "./access"
  platforms = ["linux/amd64", "linux/arm64"]
  tags = [
    "${REGISTRY_USER}/ldschurch-stream-access:${TAG}",
    "${REGISTRY_USER}/ldschurch-stream-access:latest"
  ]
}

target "landing" {
  context = "./landing"
  platforms = ["linux/amd64", "linux/arm64"]
  tags = [
    "${REGISTRY_USER}/ldschurch-stream-landing:${TAG}",
    "${REGISTRY_USER}/ldschurch-stream-landing:latest"
  ]
}
