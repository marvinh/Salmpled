using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;
namespace salmpledv2_backend.Models
{
    public class Sample : BaseEntity
    {
        public Guid Id { get; set; }
        [MaxLength(280)]
        public string Name { get; set; }
        public Guid PackId {get;set;}
        public Pack Pack { get; set; }
        public string Region { get; set; }
        public string Bucket { get; set; }
        public string UKey { get; set; }
        public string CKey { get; set; }
        public List<SampleTag> SampleTags { get; set; }
        [Precision(18, 2)]
        public decimal Tempo { get; set; }
        public string MimeType {get;set;}
    }
}