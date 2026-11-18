
import requests
import ipaddress
import socket

from urllib.parse import urlparse

from bs4 import BeautifulSoup

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from .serializers import ScrapeSerializer
from .models import ScrapeJob


# ==================================
# URL SECURITY VALIDATION
# ==================================

def is_safe_url(url):

    try:
        parsed = urlparse(url)

        # Allow only HTTP and HTTPS
        if parsed.scheme not in ["http", "https"]:
            return False

        # Hostname must exist
        hostname = parsed.hostname

        if not hostname:
            return False

        # Block localhost names
        if hostname.lower() == "localhost":
            return False

        if hostname.lower().endswith(".localhost"):
            return False

        # Block username/password in URL
        if parsed.username or parsed.password:
            return False

        # Validate port
        port = parsed.port

        if port is not None and not (1 <= port <= 65535):
            return False

        # Resolve hostname to IP addresses
        ip_addresses = socket.getaddrinfo(
            hostname,
            port or (443 if parsed.scheme == "https" else 80),
            type=socket.SOCK_STREAM
        )

        if not ip_addresses:
            return False

        # Well-known NAT64 IPv6 network
        nat64_network = ipaddress.ip_network("64:ff9b::/96")

        for address in ip_addresses:

            ip = ipaddress.ip_address(address[4][0])

            # Handle IPv4-mapped IPv6 addresses
            if isinstance(ip, ipaddress.IPv6Address) and ip.ipv4_mapped:
                ip = ip.ipv4_mapped

            # Handle well-known NAT64 addresses
            elif isinstance(ip, ipaddress.IPv6Address) and ip in nat64_network:
                ip = ipaddress.IPv4Address(
                    int(ip) & 0xffffffff
                )

            # Block unsafe IP addresses
            if (
                not ip.is_global
                or ip.is_private
                or ip.is_loopback
                or ip.is_link_local
                or ip.is_reserved
                or ip.is_multicast
                or ip.is_unspecified
            ):
                return False

        return True

    except (ValueError, socket.gaierror, OSError):
        return False


# ==================================
# SCRAPING API
# ==================================

class ScrapeAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        serializer = ScrapeSerializer(data=request.data)

        if serializer.is_valid():

            url = serializer.validated_data["url"]
            selectors = serializer.validated_data["selectors"]

            # Validate URL before making request
            if not is_safe_url(url):

                return Response({
                    "success": False,
                    "error": "Unsafe or invalid URL."
                }, status=status.HTTP_400_BAD_REQUEST)

            try:

                response = requests.get(
                    url,
                    timeout=10,
                    headers={
                        "User-Agent": "Ashparse/1.0"
                    },
                    allow_redirects=False
                )

                # Reject redirects
                if 300 <= response.status_code < 400:

                    return Response({
                        "success": False,
                        "error": "Website redirects are not allowed."
                    }, status=status.HTTP_400_BAD_REQUEST)

                response.raise_for_status()

                soup = BeautifulSoup(
                    response.text,
                    "html.parser"
                )

                results = {}

                # Extract information using CSS selectors
                for name, selector in selectors.items():

                    elements = soup.select(selector)

                    results[name] = [
                        element.get_text(strip=True)
                        for element in elements
                    ]

                # Save successful scraping job
                ScrapeJob.objects.create(
                    user=request.user,
                    url=url,
                    selectors=selectors,
                    results=results,
                    status="completed"
                )

                return Response({
                    "success": True,
                    "message": "Scraping completed successfully",
                    "data": results
                }, status=status.HTTP_200_OK)

            except requests.Timeout:

                return Response({
                    "success": False,
                    "error": "Website took too long to respond."
                }, status=status.HTTP_408_REQUEST_TIMEOUT)

            except requests.ConnectionError:

                return Response({
                    "success": False,
                    "error": "Unable to connect to the website."
                }, status=status.HTTP_400_BAD_REQUEST)

            except requests.RequestException:

                return Response({
                    "success": False,
                    "error": "An error occurred while accessing the website."
                }, status=status.HTTP_400_BAD_REQUEST)

            except Exception:

                return Response({
                    "success": False,
                    "error": "Something went wrong while scraping."
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Serializer validation errors
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


# ==================================
# SCRAPING HISTORY API
# ==================================

class ScrapeHistoryAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        jobs = ScrapeJob.objects.filter(
            user=request.user
        ).order_by("-created_at")

        data = []

        for job in jobs:

            data.append({
                "id": job.id,
                "url": job.url,
                "selectors": job.selectors,
                "results": job.results,
                "status": job.status,
                "created_at": job.created_at
            })

        return Response({
            "success": True,
            "total_jobs": len(data),
            "history": data
        }, status=status.HTTP_200_OK)
