from rest_framework import serializers


class ScrapeSerializer(serializers.Serializer):
    url = serializers.URLField()

    selectors = serializers.DictField(
        child=serializers.CharField()
    )